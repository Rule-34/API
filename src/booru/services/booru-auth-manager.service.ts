import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import cluster from 'cluster'
import {
  BooruAuthConfig,
  BooruAuthCredential,
  DisabledCredential,
  AuthCredentialStats,
  DomainCredentialStatus,
  MaskedCredentialStatus,
  AuthFailureEvent,
  IpcAuthMessage
} from '../interfaces/auth-manager.interface'
import { SENSITIVE_AUTH_PARAMS } from '../constants/sensitive-auth-params'
import { createCredentialKey, parseCredentialKey } from './credential-key.util'

@Injectable()
export class BooruAuthManagerService implements OnModuleInit {
  private disabledCredentials = new Map<string, { disabledAt: number; reason: string }>()
  private cooldownCredentials = new Map<
    string,
    { disabledAt: number; cooldownUntil: number; reason: string }
  >()
  private selectionCursorByDomain = new Map<string, number>()
  private authConfig: BooruAuthConfig = {}
  private readonly domainAliases: Record<string, string> = {
    'www.rule34.xxx': 'rule34.xxx',
    'api.rule34.xxx': 'rule34.xxx'
  }
  private readonly sensitiveParams = new Set<string>(SENSITIVE_AUTH_PARAMS)

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.loadAuthConfig()
    this.setupIpcListeners()
  }

  private loadAuthConfig(): void {
    const authConfigJson = this.configService.get<string>('BOORU_AUTH_CONFIG')

    if (!authConfigJson) {
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
      console.error('Failed to parse BOORU_AUTH_CONFIG:', error.message)
    }
  }

  private setupIpcListeners(): void {
    if (cluster.isWorker && process.send) {
      process.on('message', (message: IpcAuthMessage) => {
        if (message.type === 'DISABLE_CREDENTIAL') {
          const credential = message.payload as DisabledCredential
          this.disableCredentialLocally(credential)
        }
      })
    }
  }

  public getAvailableCredential(domain: string): BooruAuthCredential | null {
    const normalizedDomain = this.normalizeDomain(domain)
    const credentialsArray = this.authConfig[normalizedDomain]

    if (!credentialsArray || credentialsArray.length === 0) {
      return null
    }

    this.cleanupExpiredCooldowns(normalizedDomain)

    const availableCredentials = credentialsArray.filter(
      (credential) => !this.isCredentialUnavailable(normalizedDomain, credential.user, credential.password)
    )

    if (availableCredentials.length === 0) {
      console.warn(
        `🚫 No available credentials for domain: ${normalizedDomain} (${credentialsArray.length} total, all unavailable)`
      )
      return null
    }

    const selectedCredential = this.selectCredentialRoundRobin(normalizedDomain, availableCredentials)

    console.log(
      `🔑 Selected credential for ${normalizedDomain}: ${selectedCredential.user} (${availableCredentials.length}/${credentialsArray.length} available)`
    )

    return selectedCredential
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
    const cooldownSeconds = Math.max(1, authFailure.retryAfterSeconds ?? 60)
    const cooldownUntil = new Date(Date.now() + cooldownSeconds * 1000)

    const disabledCredential: DisabledCredential = isRateLimit
      ? {
          domain: normalizedDomain,
          user: authFailure.user,
          password: authFailure.password,
          disabledAt: authFailure.timestamp,
          state: 'cooldown',
          cooldownUntil,
          reason: sanitizedError
        }
      : {
          domain: normalizedDomain,
          user: authFailure.user,
          password: authFailure.password,
          disabledAt: authFailure.timestamp,
          state: 'permanent',
          reason: sanitizedError
        }

    this.disableCredentialLocally(disabledCredential)
    this.broadcastDisabledCredential(disabledCredential)

    const stats = this.getDomainStats(normalizedDomain)
    const action = isRateLimit
      ? `cooldown for ${cooldownSeconds}s`
      : 'permanently disabled'

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

  private broadcastDisabledCredential(credential: DisabledCredential): void {
    if (cluster.isWorker && process.send) {
      const message: IpcAuthMessage = {
        type: 'DISABLE_CREDENTIAL',
        payload: credential
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
    const credentials = this.authConfig[normalizedDomain] || []
    let cooldown = 0
    let permanentDisabled = 0

    for (const credential of credentials) {
      const fullKey = createCredentialKey(normalizedDomain, credential.user, credential.password)
      const userKey = createCredentialKey(normalizedDomain, credential.user)

      if (this.disabledCredentials.has(fullKey) || this.disabledCredentials.has(userKey)) {
        permanentDisabled += 1
        continue
      }

      if (this.isCooldownActive(fullKey) || this.isCooldownActive(userKey)) {
        cooldown += 1
      }
    }

    const disabled = cooldown + permanentDisabled

    return {
      domain: normalizedDomain,
      total: credentials.length,
      available: credentials.length - disabled,
      disabled,
      cooldown,
      permanentDisabled
    }
  }

  public getMinCooldownSeconds(domain: string): number | undefined {
    const normalizedDomain = this.normalizeDomain(domain)
    let minCooldownUntil: number | undefined

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

    if (minCooldownUntil === undefined) {
      return undefined
    }

    return Math.max(1, Math.ceil((minCooldownUntil - Date.now()) / 1000))
  }

  public getDomainCredentialStatus(domain: string): DomainCredentialStatus {
    const normalizedDomain = this.normalizeDomain(domain)
    this.cleanupExpiredCooldowns(normalizedDomain)

    const credentials = this.authConfig[normalizedDomain] || []
    const status = credentials.map((credential) =>
      this.getMaskedCredentialStatus(normalizedDomain, credential)
    )
    const stats = this.getDomainStats(normalizedDomain)

    return {
      ...stats,
      minCooldownSeconds: this.getMinCooldownSeconds(normalizedDomain),
      credentials: status
    }
  }

  public getCredentialPoolStatus(domain?: string): DomainCredentialStatus[] {
    if (domain) {
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
      const mergedCredentials = [...(normalizedAuthConfig[normalizedDomain] || []), ...credentials]

      normalizedAuthConfig[normalizedDomain] = this.dedupeCredentials(mergedCredentials)
    }

    return normalizedAuthConfig
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
    return this.domainAliases[extractedDomain] || extractedDomain
  }

  private extractDomainFromUrl(url: string): string {
    try {
      const hasProtocol = /^https?:\/\//i.test(url)
      const normalizedUrl = hasProtocol ? url : `https://${url}`
      const urlObj = new URL(normalizedUrl)
      return urlObj.hostname.toLowerCase()
    } catch (error) {
      return url
        .replace(/^(https?:\/\/)?/i, '')
        .split(/[?#]/)[0]
        .split('/')[0]
        .toLowerCase()
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
    } catch (error) {
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
        password,
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
        password,
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

    const statusMatch = errorMessage.match(/(?:status(?:\s*code|_code)?|http)\s*[:=]?\s*(\d{3})|\b(\d{3})\b/i)
    const statusCode = Number(statusMatch?.[1] ?? statusMatch?.[2])

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

      if (!this.isCredentialUnavailable(domain, candidate.user, candidate.password)) {
        this.selectionCursorByDomain.set(domain, (index + 1) % credentials.length)
        return candidate
      }
    }

    return null
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
    const cooldownUntil = cooldownRecord?.cooldownUntil

    if (cooldownUntil && cooldownUntil > now) {
      return {
        user: credential.user,
        state: 'cooldown',
        cooldownUntil: new Date(cooldownUntil).toISOString(),
        secondsRemaining: Math.max(1, Math.ceil((cooldownUntil - now) / 1000)),
        reason: cooldownRecord.reason
      }
    }

    return {
      user: credential.user,
      state: 'active'
    }
  }
}
