export interface ParsedCredentialKey {
  domain: string
  user: string
  password?: string
}

export function createCredentialKey(domain: string, user: string, password?: string): string {
  const encodedDomain = encodeURIComponent(domain)
  const encodedUser = encodeURIComponent(user)

  if (password === undefined) {
    return `${encodedDomain}:${encodedUser}`
  }

  const encodedPassword = encodeURIComponent(password)
  return `${encodedDomain}:${encodedUser}:${encodedPassword}`
}

export function parseCredentialKey(key: string): ParsedCredentialKey {
  const [encodedDomain = '', encodedUser = '', ...encodedPasswordParts] = key.split(':')

  return {
    domain: decodeURIComponent(encodedDomain),
    user: decodeURIComponent(encodedUser),
    password: encodedPasswordParts.length > 0 ? decodeURIComponent(encodedPasswordParts.join(':')) : undefined
  }
}
