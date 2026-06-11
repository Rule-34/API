export interface BooruAuthCredential {
  user: string
  password: string
  rateLimit?: {
    requests: number
    windowSeconds: number
  }
}

export type BooruAuthConfig = Record<string, BooruAuthCredential[]>

interface DisabledCredentialBase {
  domain: string
  user: string
  password?: string
  disabledAt: Date
  reason?: string
}

export interface PermanentDisabledCredential extends DisabledCredentialBase {
  state: 'permanent'
}

export interface CooldownDisabledCredential extends DisabledCredentialBase {
  state: 'cooldown'
  cooldownUntil: Date
}

export type DisabledCredential = PermanentDisabledCredential | CooldownDisabledCredential

export interface AuthCredentialStats {
  domain: string
  total: number
  available: number
  /**
   * Total unavailable credentials for the domain.
   * Invariant: disabled === cooldown + permanentDisabled
   */
  disabled: number
  /**
   * Credentials currently unavailable due to temporary rate-limit cooldown.
   */
  cooldown: number
  /**
   * Credentials permanently disabled due to authentication failures.
   */
  permanentDisabled: number
}

export interface ActiveMaskedCredentialStatus {
  user: string
  state: 'active'
  reason?: string
}

export interface CooldownMaskedCredentialStatus {
  user: string
  state: 'cooldown'
  /**
   * Serialized timestamp for API responses.
   */
  cooldownUntil: string
  secondsRemaining?: number
  reason?: string
}

export interface PermanentMaskedCredentialStatus {
  user: string
  state: 'permanent'
  reason?: string
}

export type MaskedCredentialStatus =
  | ActiveMaskedCredentialStatus
  | CooldownMaskedCredentialStatus
  | PermanentMaskedCredentialStatus

export interface DomainCredentialStatus extends AuthCredentialStats {
  minCooldownSeconds?: number
  credentials: MaskedCredentialStatus[]
}

export interface AuthFailureEvent {
  domain: string
  user: string
  password?: string
  error: string
  failureKind?: 'auth_invalid' | 'auth_forbidden' | 'rate_limited' | 'upstream_error' | 'network_error' | 'unknown'
  retryAfterSeconds?: number
  timestamp: Date
}

export type IpcAuthMessage =
  | { type: 'DISABLE_CREDENTIAL'; payload: DisabledCredential }
  | { type: 'RESERVE_CREDENTIAL'; payload: { requestId: string; domain: string } }
  | {
      type: 'RESERVE_CREDENTIAL_RESPONSE'
      payload: { requestId: string; credential: BooruAuthCredential | null; retryAfterSeconds?: number }
    }
