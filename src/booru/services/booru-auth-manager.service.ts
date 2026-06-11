import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import cluster from 'cluster'
import {
  BooruAuthConfig,
  BooruAuthCredential,
  DisabledCredential,
  SerializedDisabledCredential,
  AuthCredentialStats,
  DomainCredentialStatus,
  MaskedCredentialStatus,
  AuthFailureEvent,
  IpcAuthMessage
} from '../interfaces/auth-manager.interface'
import { SENSITIVE_AUTH_PARAMS } from '../constants/sensitive-auth-params'
import {
  BOORU_AUTH_DOMAIN_ALIASES,
  BOORU_AUTH_RATE_LIMIT_DEFAULTS,
  RateLimitPolicy
} from '../constants/booru-auth-provider-policies'
import { createCredentialKey, parseCredentialKey } from './credential-key.util'

interface ReservationResponse {
  credential: BooruAuthCredential | null
  retryAfterSeconds?: number
}

@Injectable()
export class BooruAuthManagerService implements OnModuleInit {
  private static readonly HTTP_STATUS_PATTERN = /(?:status(?:\s*code|_code)?|http)\s*[:=]?\s*(\d{3})|\b(\d{3})\b/i
  private static readonly IPC_RESERVATION_TIMEOUT_MS = 1_000

  private readonly disabledCredentials = new Map<string, { disabledAt: number; reason: string }>()
  private readonly cooldownCredentials = new Map<
    string,
    { disabledAt: number; cooldownUntil: number; reason: string }
  >()
  private readonly quotaReservations = new Map<string, number[]>()
  private readonly pendingReservationRequests = new Map<string, (response: ReservationResponse) => void>()
  private readonly lastReservationUnavailableUntilByDomain = new Map<string, number>()
  private readonly selectionCursorByDomain = new Map<string, number>()
  private readonly availabilityByDomain = new Map<string, number>()
  private authConfig: BooruAuthConfig = {}
  private readonly domainRateLimitDefaults: Record<string, RateLimitPolicy> = BOORU_AUTH_RATE_LIMIT_DEFAULTS
  private readonly domainAliases: Record<string, string> = BOORU_AUTH_DOMAIN_ALIASES
  private readonly sensitiveParams = new Set<string>(SENSITIVE_AUTH_PARAMS)

  constructor(@Inject(ConfigService) private readonly configService: Pick<ConfigService, 'get'>) {}

  onModuleInit() {
    this.loadAuthConfig()
    this.setupIpcListeners()
  }

  private loadAuthConfig(): void {
    const authConfigJson = this.configService.get<string>('BOORU_AUTH_CONFIG')

    if (authConfigJson === undefined || authConfigJson === '') {
      console.warn('BOORU_AUTH_CONFIG not found in environment variables')
      return
    }

    try {
      const parsedAuthConfig = JSON.parse(authConfigJson) as BooruAuthConfig
      this.authConfig = this.normalizeAuthConfig(parsedAuthConfig)
      const stats = this.getCredentialStats()
      console.log(
        '🔐 Auth manager initialized with credentials for:',
        stats.map((s) => `${s.domain} (${s.total})`).join(', ')
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('Failed to parse BOORU_AUTH_CONFIG:', message)
      throw error
    }
  }

  private setupIpcListeners(): void {
    if (cluster.isWorker && process.send) {
      process.on('message', (message: IpcAuthMessage) => {
        if (message.type === 'DISABLE_CREDENTIAL') {
          this.applyDisabledCredential(message.payload)
          return
        }

        if (message.type === 'RESERVE_CREDENTIAL_RESPONSE') {
          const response = message.payload
          const resolve = this.pendingReservationRequests.get(response.requestId)

          if (resolve === undefined) {
            return
          }

          this.pendingReservationRequests.delete(response.requestId)
          resolve({
            credential: response.credential,
            ...(response.retryAfterSeconds !== undefined ? { retryAfterSeconds: response.retryAfterSeconds } : {})
          })
        }
      })
    }
  }

  public async reserveAvailableCredential(domain: string): Promise<BooruAuthCredential | null> {
    if (cluster.isWorker && process.send && process.env['NODE_ENV'] === 'production') {
      return this.reserveAvailableCredentialFromPrimary(domain)
    }

    return this.reserveAvailableCredentialLocally(domain).credential
  }

  public reserveAvailableCredentialLocally(domain: string): ReservationResponse {
    const normalizedDomain = this.normalizeDomain(domain)
    const credentialsArray = this.authConfig[normalizedDomain]

    if (!credentialsArray || credentialsArray.length === 0) {
      return { credential: null }
    }

    this.cleanupExpiredCooldowns(normalizedDomain)
    this.cleanupExpiredQuotaReservations(normalizedDomain)

    const selectedCredential = this.selectCredentialRoundRobin(normalizedDomain, credentialsArray)

    if (selectedCredential !== null) {
      this.recordQuotaReservation(normalizedDomain, selectedCredential)
      this.lastReservationUnavailableUntilByDomain.delete(normalizedDomain)
      return { credential: selectedCredential }
    }

    const retryAfterSeconds = this.getMinCooldownSeconds(normalizedDomain)

    if (retryAfterSeconds !== undefined) {
      this.lastReservationUnavailableUntilByDomain.set(normalizedDomain, Date.now() + retryAfterSeconds * 1_000)
    }

    return {
      credential: null,
      ...(retryAfterSeconds !== undefined ? { retryAfterSeconds } : {})
    }
  }

  public applyDisabledCredential(credential: DisabledCredential | SerializedDisabledCredential): void {
    this.disableCredentialLocally(this.rehydrateDisabledCredential(credential))
  }

  private reserveAvailableCredentialFromPrimary(domain: string): Promise<BooruAuthCredential | null> {
    return new Promise((resolve) => {
      const normalizedDomain = this.normalizeDomain(domain)
      const requestId = `${process.pid}:${Date.now()}:${Math.random().toString(36).slice(2)}`
      const timeout = setTimeout(() => {
        this.pendingReservationRequests.delete(requestId)
        resolve(null)
      }, BooruAuthManagerService.IPC_RESERVATION_TIMEOUT_MS)

      this.pendingReservationRequests.set(requestId, (response) => {
        clearTimeout(timeout)

        if (response.retryAfterSeconds !== undefined) {
          this.lastReservationUnavailableUntilByDomain.set(
            normalizedDomain,
            Date.now() + response.retryAfterSeconds * 1_000
          )
        }

        resolve(response.credential)
      })

      process.send?.({
        type: 'RESERVE_CREDENTIAL',
        payload: {
          requestId,
          domain
        }
      } satisfies IpcAuthMessage)
    })
  }

  public reportAuthFailure(authFailure: AuthFailureEvent): void {
    const normalizedDomain = this.normalizeDomain(authFailure.domain)
    const sanitizedError = this.sanitizeErrorMessage(authFailure.error)
    const sanitizedUser = this.sanitizeUserIdentifier(authFailure.user)
    const failureKind = this.resolveFailureKind(authFailure)

    if (this.isCredentialUnavailable(normalizedDomain, authFailure.user, authFailure.password)) {
      return
    }

    const isRateLimit = failureKind === 'rate_limited'
    const fallbackCooldownSeconds = this.getRateLimitFallbackSeconds(
      normalizedDomain,
      authFailure.user,
      authFailure.password
    )
    const cooldownSeconds = Math.max(1, authFailure.retryAfterSeconds ?? fallbackCooldownSeconds)
    const cooldownUntil = new Date(Date.now() + cooldownSeconds * 1000)
    const baseCredential = {
      domain: normalizedDomain,
      user: authFailure.user,
      disabledAt: authFailure.timestamp,
      reason: sanitizedError,
      ...(authFailure.password !== undefined ? { password: authFailure.password } : {})
    }

    const disabledCredential: DisabledCredential = isRateLimit
      ? {
          ...baseCredential,
          state: 'cooldown',
          cooldownUntil
        }
      : {
          ...baseCredential,
          state: 'permanent'
        }

    this.disableCredentialLocally(disabledCredential)
    this.broadcastDisabledCredential(disabledCredential)

    const stats = this.getDomainStats(normalizedDomain)
    const action = isRateLimit ? `cooldown for ${cooldownSeconds}s` : 'permanently disabled'

    console.error(`❌ Auth failure for ${normalizedDomain}:${sanitizedUser} - ${sanitizedError} (${action})`)
    console.warn(
      `📊 ${normalizedDomain} credentials: ${stats.available}/${stats.total} available, ${stats.disabled} disabled`
    )
  }

  private disableCredentialLocally(credential: DisabledCredential): void {
    const normalizedDomain = this.normalizeDomain(credential.domain)
    const credentialKey = createCredentialKey(normalizedDomain, credential.user, credential.password)
    const disabledAt = credential.disabledAt.getTime()
    const reason = credential.reason ?? 'Unknown failure'

    if (credential.state === 'cooldown') {
      const cooldownUntilMs = credential.cooldownUntil.getTime()
      this.cooldownCredentials.set(credentialKey, {
        disabledAt,
        cooldownUntil: cooldownUntilMs,
        reason
      })
      return
    }

    this.disabledCredentials.set(credentialKey, {
      disabledAt,
      reason
    })
    this.cooldownCredentials.delete(credentialKey)
  }

  private rehydrateDisabledCredential(raw: DisabledCredential | SerializedDisabledCredential): DisabledCredential {
    // IPC serializes Date objects as ISO strings — reconstruct them before use.
    return raw.state === 'cooldown'
      ? { ...raw, disabledAt: new Date(raw.disabledAt), cooldownUntil: new Date(raw.cooldownUntil) }
      : { ...raw, disabledAt: new Date(raw.disabledAt) }
  }

  private serializeDisabledCredential(credential: DisabledCredential): SerializedDisabledCredential {
    return credential.state === 'cooldown'
      ? {
          ...credential,
          disabledAt: credential.disabledAt.toISOString(),
          cooldownUntil: credential.cooldownUntil.toISOString()
        }
      : {
          ...credential,
          disabledAt: credential.disabledAt.toISOString()
        }
  }

  private broadcastDisabledCredential(credential: DisabledCredential): void {
    if (cluster.isWorker && process.send) {
      const message: IpcAuthMessage = {
        type: 'DISABLE_CREDENTIAL',
        payload: this.serializeDisabledCredential(credential)
      }
      process.send(message)
    }
  }

  private isCredentialUnavailable(domain: string, user: string, password?: string): boolean {
    const normalizedDomain = this.normalizeDomain(domain)
    const userScopedCredentialKey = createCredentialKey(normalizedDomain, user)

    if (this.disabledCredentials.has(userScopedCredentialKey)) {
      return true
    }

    if (this.isCooldownActive(userScopedCredentialKey)) {
      return true
    }

    if (password === undefined) {
      return false
    }

    const passwordScopedCredentialKey = createCredentialKey(normalizedDomain, user, password)
    if (this.disabledCredentials.has(passwordScopedCredentialKey)) {
      return true
    }

    return this.isCooldownActive(passwordScopedCredentialKey)
  }

  public getCredentialStats(): AuthCredentialStats[] {
    return Object.entries(this.authConfig).map(([domain]) => {
      return this.getDomainStats(domain)
    })
  }

  public getDomainStats(domain: string): AuthCredentialStats {
    const normalizedDomain = this.normalizeDomain(domain)
    const credentials = this.authConfig[normalizedDomain] ?? []
    let cooldown = 0
    let permanentDisabled = 0

    for (const credential of credentials) {
      const fullKey = createCredentialKey(normalizedDomain, credential.user, credential.password)
      const userKey = createCredentialKey(normalizedDomain, credential.user)

      if (this.disabledCredentials.has(fullKey) || this.disabledCredentials.has(userKey)) {
        permanentDisabled += 1
        continue
      }

      if (
        this.isCooldownActive(fullKey) ||
        this.isCooldownActive(userKey) ||
        this.isQuotaFull(normalizedDomain, credential)
      ) {
        cooldown += 1
      }
    }

    const disabled = cooldown + permanentDisabled

    const stats: AuthCredentialStats = {
      domain: normalizedDomain,
      total: credentials.length,
      available: credentials.length - disabled,
      disabled,
      cooldown,
      permanentDisabled
    }

    this.trackAvailabilityTransition(stats)

    return stats
  }

  private trackAvailabilityTransition(stats: AuthCredentialStats): void {
    const previousAvailable = this.availabilityByDomain.get(stats.domain)
    const currentAvailable = stats.available

    this.availabilityByDomain.set(stats.domain, currentAvailable)

    if (previousAvailable === undefined || previousAvailable === currentAvailable) {
      return
    }

    if (previousAvailable > 0 && currentAvailable === 0) {
      console.warn(`🚨 Credential pool exhausted for ${stats.domain} (0/${stats.total} available)`)
      return
    }

    if (previousAvailable > 1 && currentAvailable <= 1) {
      console.warn(`⚠️ Low credential availability for ${stats.domain} (${currentAvailable}/${stats.total} available)`)
      return
    }

    if (previousAvailable === 0 && currentAvailable > 0) {
      console.log(`✅ Credential pool recovered for ${stats.domain} (${currentAvailable}/${stats.total} available)`)
      return
    }

    if (previousAvailable <= 1 && currentAvailable > 1) {
      console.log(
        `ℹ️ Credential availability normalized for ${stats.domain} (${currentAvailable}/${stats.total} available)`
      )
    }
  }

  public getMinCooldownSeconds(domain: string): number | undefined {
    const normalizedDomain = this.normalizeDomain(domain)
    let minCooldownUntil: number | undefined

    const reservationUnavailableUntil = this.lastReservationUnavailableUntilByDomain.get(normalizedDomain)

    if (reservationUnavailableUntil !== undefined) {
      if (reservationUnavailableUntil <= Date.now()) {
        this.lastReservationUnavailableUntilByDomain.delete(normalizedDomain)
      } else {
        minCooldownUntil = reservationUnavailableUntil
      }
    }

    for (const [credentialKey, cooldownInfo] of this.cooldownCredentials.entries()) {
      const { domain: keyDomain } = parseCredentialKey(credentialKey)

      if (keyDomain !== normalizedDomain) {
        continue
      }

      const cooldownUntil = cooldownInfo.cooldownUntil

      if (cooldownUntil <= Date.now()) {
        this.cooldownCredentials.delete(credentialKey)
        continue
      }

      if (minCooldownUntil === undefined || cooldownUntil < minCooldownUntil) {
        minCooldownUntil = cooldownUntil
      }
    }

    for (const credential of this.authConfig[normalizedDomain] ?? []) {
      const quotaRetryAfterSeconds = this.getQuotaRetryAfterSeconds(normalizedDomain, credential)

      if (quotaRetryAfterSeconds === undefined) {
        continue
      }

      const quotaCooldownUntil = Date.now() + quotaRetryAfterSeconds * 1_000

      if (minCooldownUntil === undefined || quotaCooldownUntil < minCooldownUntil) {
        minCooldownUntil = quotaCooldownUntil
      }
    }

    if (minCooldownUntil === undefined) {
      return undefined
    }

    return Math.max(1, Math.ceil((minCooldownUntil - Date.now()) / 1000))
  }

  public getDomainCredentialStatus(domain: string): DomainCredentialStatus {
    const normalizedDomain = this.normalizeDomain(domain)
    this.cleanupExpiredCooldowns(normalizedDomain)

    const credentials = this.authConfig[normalizedDomain] ?? []
    const credentialStatuses = credentials.map((credential) =>
      this.getMaskedCredentialStatus(normalizedDomain, credential)
    )
    const stats = this.getDomainStats(normalizedDomain)

    const domainStatus: DomainCredentialStatus = {
      ...stats,
      credentials: credentialStatuses
    }

    const minCooldownSeconds = this.getMinCooldownSeconds(normalizedDomain)

    if (minCooldownSeconds !== undefined) {
      domainStatus.minCooldownSeconds = minCooldownSeconds
    }

    return domainStatus
  }

  public getCredentialPoolStatus(domain?: string): DomainCredentialStatus[] {
    if (domain !== undefined && domain !== '') {
      return [this.getDomainCredentialStatus(domain)]
    }

    return Object.keys(this.authConfig)
      .sort()
      .map((key) => this.getDomainCredentialStatus(key))
  }

  private normalizeAuthConfig(authConfig: BooruAuthConfig): BooruAuthConfig {
    const normalizedAuthConfig: BooruAuthConfig = {}

    for (const [domain, credentials] of Object.entries(authConfig)) {
      const normalizedDomain = this.normalizeDomain(domain)
      const validatedCredentials = this.validateAuthConfigCredentials(normalizedDomain, credentials)

      const mergedCredentials = [...(normalizedAuthConfig[normalizedDomain] ?? []), ...validatedCredentials]

      normalizedAuthConfig[normalizedDomain] = this.dedupeCredentials(mergedCredentials)
    }

    return normalizedAuthConfig
  }

  private validateAuthConfigCredentials(domain: string, credentials: unknown): BooruAuthCredential[] {
    if (!Array.isArray(credentials)) {
      throw new Error(`Invalid BOORU_AUTH_CONFIG credentials list for ${domain}`)
    }

    const validCredentials: BooruAuthCredential[] = []

    for (const [index, credential] of credentials.entries()) {
      if (!this.isValidAuthCredentialShape(credential)) {
        throw new Error(`Invalid BOORU_AUTH_CONFIG credential for ${domain} at index ${index}`)
      }

      if (credential.rateLimit !== undefined && !this.isValidRateLimitPolicy(credential.rateLimit)) {
        throw new Error(`Invalid BOORU_AUTH_CONFIG rateLimit for ${domain} at index ${index}`)
      }

      validCredentials.push(credential)
    }

    return validCredentials
  }

  private isValidAuthCredentialShape(credential: unknown): credential is BooruAuthCredential {
    if (!this.isRecord(credential)) {
      return false
    }

    const user = credential['user']
    const password = credential['password']

    return typeof user === 'string' && user.length > 0 && typeof password === 'string' && password.length > 0
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
  }

  private isValidRateLimitPolicy(rateLimit: BooruAuthCredential['rateLimit']): rateLimit is RateLimitPolicy {
    if (rateLimit === undefined) {
      return false
    }

    const requests = Math.floor(rateLimit.requests)
    const windowSeconds = Math.floor(rateLimit.windowSeconds)

    return Number.isFinite(requests) && requests > 0 && Number.isFinite(windowSeconds) && windowSeconds > 0
  }

  private dedupeCredentials(credentials: BooruAuthCredential[]): BooruAuthCredential[] {
    const uniqueCredentials = new Map<string, BooruAuthCredential>()

    for (const credential of credentials) {
      const credentialKey = JSON.stringify([credential.user, credential.password])

      if (!uniqueCredentials.has(credentialKey)) {
        uniqueCredentials.set(credentialKey, credential)
      }
    }

    return Array.from(uniqueCredentials.values())
  }

  private normalizeDomain(domain: string): string {
    const extractedDomain = this.extractDomainFromUrl(domain)
    return this.domainAliases[extractedDomain] ?? extractedDomain
  }

  private extractDomainFromUrl(url: string): string {
    try {
      const hasProtocol = /^https?:\/\//i.test(url)
      const normalizedUrl = hasProtocol ? url : `https://${url}`
      const urlObj = new URL(normalizedUrl)
      return urlObj.hostname.toLowerCase()
    } catch {
      const [urlWithoutQuery = ''] = url.replace(/^(https?:\/\/)?/i, '').split(/[?#]/)
      const [domain = ''] = urlWithoutQuery.split('/')

      return domain.toLowerCase()
    }
  }

  private sanitizeErrorMessage(message: string): string {
    if (!message) {
      return message
    }

    const urlPattern = /https?:\/\/[^\s]+/gi
    const sanitizedUrlMessage = message.replace(urlPattern, (url) => this.sanitizeUrl(url))
    return this.sanitizeKeyValueTokens(sanitizedUrlMessage)
  }

  private sanitizeUserIdentifier(user: string): string {
    if (!user) {
      return 'REDACTED'
    }

    return `REDACTED(${user.length})`
  }

  private sanitizeKeyValueTokens(message: string): string {
    let sanitizedMessage = message

    for (const key of this.sensitiveParams) {
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const pattern = new RegExp(`\\b(${escapedKey})(\\s*=\\s*)([^\\s&#,;\\]\\)\\}]+)`, 'gi')
      sanitizedMessage = sanitizedMessage.replace(pattern, '$1$2REDACTED')
    }

    return sanitizedMessage
  }

  private sanitizeUrl(url: string): string {
    try {
      const urlObj = new URL(url)

      for (const [key] of urlObj.searchParams.entries()) {
        if (this.sensitiveParams.has(key.toLowerCase())) {
          urlObj.searchParams.set(key, 'REDACTED')
        }
      }

      return urlObj.toString()
    } catch {
      return this.sanitizeRawUrl(url)
    }
  }

  private sanitizeRawUrl(url: string): string {
    let sanitizedUrl = url

    for (const key of this.sensitiveParams) {
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const pattern = new RegExp(`([?&]${escapedKey}=)[^&#\\s]*`, 'gi')
      sanitizedUrl = sanitizedUrl.replace(pattern, '$1REDACTED')
    }

    return sanitizedUrl
  }

  public getDisabledCredentials(): DisabledCredential[] {
    const permanentCredentials = Array.from(this.disabledCredentials.entries()).map(([key, record]) => {
      const { domain, user, password } = parseCredentialKey(key)

      return {
        domain,
        user,
        ...(password !== undefined ? { password } : {}),
        disabledAt: new Date(record.disabledAt),
        state: 'permanent' as const,
        reason: record.reason
      }
    })

    const cooldownCredentials = Array.from(this.cooldownCredentials.entries()).map(([key, record]) => {
      const { domain, user, password } = parseCredentialKey(key)

      return {
        domain,
        user,
        ...(password !== undefined ? { password } : {}),
        disabledAt: new Date(record.disabledAt),
        state: 'cooldown' as const,
        cooldownUntil: new Date(record.cooldownUntil),
        reason: record.reason
      }
    })

    return [...permanentCredentials, ...cooldownCredentials]
  }

  private resolveFailureKind(authFailure: AuthFailureEvent): AuthFailureEvent['failureKind'] {
    if (authFailure.failureKind) {
      return authFailure.failureKind
    }

    const errorMessage = authFailure.error.toLowerCase()

    const statusMatch = errorMessage.match(BooruAuthManagerService.HTTP_STATUS_PATTERN)
    const [, statusFromLabel, statusFromBare] = statusMatch ?? []
    const statusCode = Number(statusFromLabel ?? statusFromBare)

    if (statusCode === 429) {
      return 'rate_limited'
    }

    if (statusCode === 403) {
      return 'auth_forbidden'
    }

    if (statusCode === 401) {
      return 'auth_invalid'
    }

    return 'unknown'
  }

  private isCooldownActive(credentialKey: string): boolean {
    const cooldownInfo = this.cooldownCredentials.get(credentialKey)

    if (cooldownInfo === undefined) {
      return false
    }

    const cooldownUntil = cooldownInfo.cooldownUntil

    if (cooldownUntil <= Date.now()) {
      this.cooldownCredentials.delete(credentialKey)
      return false
    }

    return true
  }

  private cleanupExpiredCooldowns(domain: string): void {
    const normalizedDomain = this.normalizeDomain(domain)

    for (const [credentialKey, cooldownInfo] of this.cooldownCredentials.entries()) {
      const { domain: keyDomain } = parseCredentialKey(credentialKey)

      if (keyDomain === normalizedDomain && cooldownInfo.cooldownUntil <= Date.now()) {
        this.cooldownCredentials.delete(credentialKey)
      }
    }
  }

  private selectCredentialRoundRobin(domain: string, credentials: BooruAuthCredential[]): BooruAuthCredential | null {
    if (credentials.length === 0) {
      return null
    }

    const currentCursor = this.selectionCursorByDomain.get(domain) ?? 0

    for (let offset = 0; offset < credentials.length; offset++) {
      const index = (currentCursor + offset) % credentials.length
      const candidate = credentials[index]

      if (candidate === undefined) {
        continue
      }

      if (
        !this.isCredentialUnavailable(domain, candidate.user, candidate.password) &&
        !this.isQuotaFull(domain, candidate)
      ) {
        this.selectionCursorByDomain.set(domain, (index + 1) % credentials.length)
        return candidate
      }
    }

    return null
  }

  private getRateLimitFallbackSeconds(domain: string, user: string, password?: string): number {
    const credential = (this.authConfig[domain] ?? []).find(
      (candidate) => candidate.user === user && (password === undefined || candidate.password === password)
    )
    const policy = credential ? this.getRateLimitPolicy(domain, credential) : this.domainRateLimitDefaults[domain]

    return policy?.windowSeconds ?? 60
  }

  private getRateLimitPolicy(domain: string, credential: BooruAuthCredential): RateLimitPolicy | undefined {
    if (credential.rateLimit !== undefined) {
      const requests = Math.floor(credential.rateLimit.requests)
      const windowSeconds = Math.floor(credential.rateLimit.windowSeconds)

      if (Number.isFinite(requests) && requests > 0 && Number.isFinite(windowSeconds) && windowSeconds > 0) {
        return { requests, windowSeconds }
      }
    }

    return this.domainRateLimitDefaults[this.normalizeDomain(domain)]
  }

  private getQuotaReservationKey(domain: string, credential: BooruAuthCredential): string {
    return createCredentialKey(this.normalizeDomain(domain), credential.user, credential.password)
  }

  private cleanupExpiredQuotaReservations(domain: string): void {
    const normalizedDomain = this.normalizeDomain(domain)

    for (const credential of this.authConfig[normalizedDomain] ?? []) {
      this.getQuotaRetryAfterSeconds(normalizedDomain, credential)
    }
  }

  private getQuotaRetryAfterSeconds(domain: string, credential: BooruAuthCredential): number | undefined {
    const policy = this.getRateLimitPolicy(domain, credential)

    if (policy === undefined) {
      return undefined
    }

    const reservationKey = this.getQuotaReservationKey(domain, credential)
    const now = Date.now()
    const windowMs = policy.windowSeconds * 1_000
    const reservations = this.pruneQuotaReservations(reservationKey, windowMs, now)

    if (reservations.length < policy.requests) {
      return undefined
    }

    const oldestReservation = reservations[0]

    if (oldestReservation === undefined) {
      return undefined
    }

    return Math.max(1, Math.ceil((oldestReservation + windowMs - now) / 1_000))
  }

  private isQuotaFull(domain: string, credential: BooruAuthCredential): boolean {
    return this.getQuotaRetryAfterSeconds(domain, credential) !== undefined
  }

  private recordQuotaReservation(domain: string, credential: BooruAuthCredential): void {
    const policy = this.getRateLimitPolicy(domain, credential)

    if (policy === undefined) {
      return
    }

    const reservationKey = this.getQuotaReservationKey(domain, credential)
    const now = Date.now()
    const windowMs = policy.windowSeconds * 1_000
    const reservations = this.pruneQuotaReservations(reservationKey, windowMs, now)

    reservations.push(now)
    this.quotaReservations.set(reservationKey, reservations)
  }

  private pruneQuotaReservations(reservationKey: string, windowMs: number, now: number): number[] {
    const reservations = (this.quotaReservations.get(reservationKey) ?? []).filter(
      (timestamp) => now - timestamp < windowMs
    )

    if (reservations.length === 0) {
      this.quotaReservations.delete(reservationKey)
    } else {
      this.quotaReservations.set(reservationKey, reservations)
    }

    return reservations
  }

  private getMaskedCredentialStatus(domain: string, credential: BooruAuthCredential): MaskedCredentialStatus {
    const fullKey = createCredentialKey(domain, credential.user, credential.password)
    const userKey = createCredentialKey(domain, credential.user)
    const now = Date.now()

    const permanentRecord = this.disabledCredentials.get(fullKey) ?? this.disabledCredentials.get(userKey)

    if (permanentRecord) {
      return {
        user: credential.user,
        state: 'permanent',
        reason: permanentRecord.reason
      }
    }

    const cooldownRecord = this.cooldownCredentials.get(fullKey) ?? this.cooldownCredentials.get(userKey)

    if (cooldownRecord !== undefined && cooldownRecord.cooldownUntil > now) {
      return {
        user: credential.user,
        state: 'cooldown',
        cooldownUntil: new Date(cooldownRecord.cooldownUntil).toISOString(),
        secondsRemaining: Math.max(1, Math.ceil((cooldownRecord.cooldownUntil - now) / 1000)),
        reason: cooldownRecord.reason
      }
    }

    const quotaRetryAfterSeconds = this.getQuotaRetryAfterSeconds(domain, credential)

    if (quotaRetryAfterSeconds !== undefined) {
      return {
        user: credential.user,
        state: 'cooldown',
        cooldownUntil: new Date(now + quotaRetryAfterSeconds * 1_000).toISOString(),
        secondsRemaining: quotaRetryAfterSeconds,
        reason: 'quota_exhausted'
      }
    }

    return {
      user: credential.user,
      state: 'active'
    }
  }
}
