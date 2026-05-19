import type { ResolvedAuthCredentials } from '../booru.service'

export interface BooruAuthContext {
  baseEndpoint: string
  credential?: { user: string; password: string }
  source: ResolvedAuthCredentials['source']
}

export interface BooruHttpRequest {
  hostname: string
  protocol?: string
  url: string
  query?: {
    auth_user?: string
    auth_pass?: string
    baseEndpoint?: string
  }
  body?: {
    auth_user?: string
    auth_pass?: string
    baseEndpoint?: string
  }
  booruAuthContext?: BooruAuthContext
}
