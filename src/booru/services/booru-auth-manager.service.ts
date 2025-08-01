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
      this.authConfig = JSON.parse(authConfigJson)
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
    const normalizedDomain = this.extractDomainFromUrl(domain)
    const credentialsArray = this.authConfig[normalizedDomain]

    if (!credentialsArray || credentialsArray.length === 0) {
      return null
    }

    const availableCredentials = credentialsArray.filter(
      (credential) => !this.isCredentialDisabled(normalizedDomain, credential.user)
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
    const credentialKey = `${authFailure.domain}:${authFailure.user}`

    if (this.disabledCredentials.has(credentialKey)) {
      return
    }

    const disabledCredential: DisabledCredential = {
      domain: authFailure.domain,
      user: authFailure.user,
      disabledAt: authFailure.timestamp,
      reason: authFailure.error
    }

    this.disableCredentialLocally(disabledCredential)
    this.broadcastDisabledCredential(disabledCredential)

    const stats = this.getDomainStats(authFailure.domain)
    console.error(`❌ Auth failure for ${authFailure.domain}:${authFailure.user} - ${authFailure.error}`)
    console.warn(
      `📊 ${authFailure.domain} credentials: ${stats.available}/${stats.total} available, ${stats.disabled} disabled`
    )
  }

  private disableCredentialLocally(credential: DisabledCredential): void {
    const credentialKey = `${credential.domain}:${credential.user}`
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

  private isCredentialDisabled(domain: string, user: string): boolean {
    const credentialKey = `${domain}:${user}`
    return this.disabledCredentials.has(credentialKey)
  }

  public getCredentialStats(): AuthCredentialStats[] {
    return Object.entries(this.authConfig).map(([domain]) => {
      return this.getDomainStats(domain)
    })
  }

  private getDomainStats(domain: string): AuthCredentialStats {
    const credentials = this.authConfig[domain] || []
    const disabled = credentials.filter((cred) => this.isCredentialDisabled(domain, cred.user)).length

    return {
      domain,
      total: credentials.length,
      available: credentials.length - disabled,
      disabled
    }
  }

  private extractDomainFromUrl(url: string): string {
    try {
      const normalizedUrl = url.startsWith('http') ? url : `https://${url}`
      const urlObj = new URL(normalizedUrl)
      return urlObj.hostname.replace(/^www\./, '')
    } catch (error) {
      return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]
    }
  }

  public getDisabledCredentials(): DisabledCredential[] {
    return Array.from(this.disabledCredentials).map((key) => {
      const [domain, user] = key.split(':')
      return {
        domain,
        user,
        disabledAt: new Date(),
        reason: 'Authentication failure'
      }
    })
  }
}
