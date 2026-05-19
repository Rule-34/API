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

  const parsedCredentialKey: ParsedCredentialKey = {
    domain: decodeURIComponent(encodedDomain),
    user: decodeURIComponent(encodedUser)
  }

  if (encodedPasswordParts.length > 0) {
    parsedCredentialKey.password = decodeURIComponent(encodedPasswordParts.join(':'))
  }

  return parsedCredentialKey
}
