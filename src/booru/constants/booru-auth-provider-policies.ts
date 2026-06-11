export interface RateLimitPolicy {
  requests: number
  windowSeconds: number
}

export interface BooruAuthProviderPolicy {
  canonicalDomain: string
  aliases?: string[]
  rateLimit: RateLimitPolicy
}

export const BOORU_AUTH_PROVIDER_POLICIES: BooruAuthProviderPolicy[] = [
  {
    canonicalDomain: 'gelbooru.com',
    rateLimit: { requests: 10, windowSeconds: 1 }
  },
  {
    canonicalDomain: 'www.gelbooru.com',
    rateLimit: { requests: 10, windowSeconds: 1 }
  },
  {
    canonicalDomain: 'rule34.xxx',
    aliases: ['api.rule34.xxx', 'www.rule34.xxx'],
    rateLimit: { requests: 60, windowSeconds: 60 }
  }
]

export const BOORU_AUTH_DOMAIN_ALIASES = BOORU_AUTH_PROVIDER_POLICIES.reduce<Record<string, string>>(
  (aliases, policy) => {
    for (const alias of policy.aliases ?? []) {
      aliases[alias] = policy.canonicalDomain
    }

    return aliases
  },
  {}
)

export const BOORU_AUTH_RATE_LIMIT_DEFAULTS = BOORU_AUTH_PROVIDER_POLICIES.reduce<Record<string, RateLimitPolicy>>(
  (defaults, policy) => {
    defaults[policy.canonicalDomain] = policy.rateLimit

    for (const alias of policy.aliases ?? []) {
      defaults[alias] = policy.rateLimit
    }

    return defaults
  },
  {}
)
