import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import cluster from 'cluster'
import {
  BooruAuthConfig,
  BooruAuthCredential,
  DisabledCredential,
  AuthCredentialStats,
  AuthFailureEvent,
  IpcAuthMessage
} from '../interfaces/auth-manager.interface'

@Injectable()
export class BooruAuthManagerService implements OnModuleInit {
  private disabledCredentials = new Set<string>()
  private authConfig: BooruAuthConfig = {}
  private readonly domainAliases: Record<string, string> = {
    'www.rule34.xxx': 'rule34.xxx',
    'api.rule34.xxx': 'rule34.xxx'
  }
  private readonly sensitiveParams = new Set([
    'user_id',
    'api_key',
    'password',
    'password_hash',
    'pass_hash',
    'auth_user',
    'auth_pass',
    'token',
    'secret',
    'key',
    'access_token',
    'auth_token',
    'session_id',
    'session',
    'login',
    'username',
    'user',
    'hash'
  ])

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

    const availableCredentials = credentialsArray.filter(
      (credential) => !this.isCredentialDisabled(normalizedDomain, credential.user, credential.password)
    )

    if (availableCredentials.length === 0) {
      console.warn(
        `🚫 No available credentials for domain: ${normalizedDomain} (${credentialsArray.length} total, all disabled)`
      )
      return null
    }

    const randomIndex = Math.floor(Math.random() * availableCredentials.length)
    const selectedCredential = availableCredentials[randomIndex]

    console.log(
      `🔑 Selected credential for ${normalizedDomain}: ${selectedCredential.user} (${availableCredentials.length}/${credentialsArray.length} available)`
    )

    return selectedCredential
  }

  public reportAuthFailure(authFailure: AuthFailureEvent): void {
    const normalizedDomain = this.normalizeDomain(authFailure.domain)
    const sanitizedError = this.sanitizeErrorMessage(authFailure.error)

    if (this.isCredentialDisabled(normalizedDomain, authFailure.user, authFailure.password)) {
      return
    }

    const disabledCredential: DisabledCredential = {
      domain: normalizedDomain,
      user: authFailure.user,
      password: authFailure.password,
      disabledAt: authFailure.timestamp,
      reason: sanitizedError
    }

    this.disableCredentialLocally(disabledCredential)
    this.broadcastDisabledCredential(disabledCredential)

    const stats = this.getDomainStats(normalizedDomain)
    console.error(`❌ Auth failure for ${normalizedDomain}:${authFailure.user} - ${sanitizedError}`)
    console.warn(
      `📊 ${normalizedDomain} credentials: ${stats.available}/${stats.total} available, ${stats.disabled} disabled`
    )
  }

  private disableCredentialLocally(credential: DisabledCredential): void {
    const normalizedDomain = this.normalizeDomain(credential.domain)
    const credentialKey = this.getCredentialKey(normalizedDomain, credential.user, credential.password)
    this.disabledCredentials.add(credentialKey)
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

  private isCredentialDisabled(domain: string, user: string, password?: string): boolean {
    const normalizedDomain = this.normalizeDomain(domain)
    const userScopedCredentialKey = this.getCredentialKey(normalizedDomain, user)

    if (this.disabledCredentials.has(userScopedCredentialKey)) {
      return true
    }

    if (password === undefined) {
      return false
    }

    const passwordScopedCredentialKey = this.getCredentialKey(normalizedDomain, user, password)
    return this.disabledCredentials.has(passwordScopedCredentialKey)
  }

  public getCredentialStats(): AuthCredentialStats[] {
    return Object.entries(this.authConfig).map(([domain]) => {
      return this.getDomainStats(domain)
    })
  }

  private getDomainStats(domain: string): AuthCredentialStats {
    const normalizedDomain = this.normalizeDomain(domain)
    const credentials = this.authConfig[normalizedDomain] || []
    const disabled = credentials.filter((cred) => this.isCredentialDisabled(normalizedDomain, cred.user, cred.password)).length

    return {
      domain: normalizedDomain,
      total: credentials.length,
      available: credentials.length - disabled,
      disabled
    }
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

  private getCredentialKey(domain: string, user: string, password?: string): string {
    const encodedUser = encodeURIComponent(user)

    if (password === undefined) {
      return `${domain}:${encodedUser}`
    }

    const encodedPassword = encodeURIComponent(password)
    return `${domain}:${encodedUser}:${encodedPassword}`
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
        .split('/')[0]
        .toLowerCase()
    }
  }

  private sanitizeErrorMessage(message: string): string {
    if (!message) {
      return message
    }

    const urlPattern = /https?:\/\/[^\s]+/g
    return message.replace(urlPattern, (url) => this.sanitizeUrl(url))
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
      return url
    }
  }

  public getDisabledCredentials(): DisabledCredential[] {
    return Array.from(this.disabledCredentials).map((key) => {
      const [domain, encodedUser, ...encodedPasswordParts] = key.split(':')
      const user = decodeURIComponent(encodedUser)
      const password =
        encodedPasswordParts.length > 0 ? decodeURIComponent(encodedPasswordParts.join(':')) : undefined

      return {
        domain,
        user,
        password,
        disabledAt: new Date(),
        reason: 'Authentication failure'
      }
    })
  }
}
