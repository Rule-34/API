export interface BooruAuthCredential {
  user: string
  password: string
}

export interface BooruAuthConfig {
  [domain: string]: BooruAuthCredential[]
}

export interface DisabledCredential {
  domain: string
  user: string
  disabledAt: Date
  reason?: string
}

export interface AuthCredentialStats {
  domain: string
  total: number
  available: number
  disabled: number
}

export interface AuthFailureEvent {
  domain: string
  user: string
  error: string
  timestamp: Date
}

export interface IpcAuthMessage {
  type: 'DISABLE_CREDENTIAL' | 'CREDENTIAL_STATS_REQUEST' | 'CREDENTIAL_STATS_RESPONSE'
  payload: DisabledCredential | AuthCredentialStats[] | { requestId: string }
}
