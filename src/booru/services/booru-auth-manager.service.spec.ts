import { Test, TestingModule } from '@nestjs/testing'
import { ConfigModule } from '@nestjs/config'
import { BooruAuthManagerService } from './booru-auth-manager.service'

describe('BooruAuthManagerService', () => {
  let service: BooruAuthManagerService

  const originalAuthConfig = process.env.BOORU_AUTH_CONFIG

  beforeEach(async () => {
    process.env.BOORU_AUTH_CONFIG = JSON.stringify({
      'rule34.xxx': [{ user: 'canonical-user', password: 'canonical-pass' }],
      'api.rule34.xxx': [
        { user: 'canonical-user', password: 'canonical-pass' },
        { user: 'api-user', password: 'api-pass' }
      ],
      'gelbooru.com': [{ user: 'gel-user', password: 'gel-pass' }],
      'www.gelbooru.com': [{ user: 'www-gel-user', password: 'www-gel-pass' }],
      'same-user.test': [
        { user: 'shared-user', password: 'first-pass' },
        { user: 'shared-user', password: 'second-pass' }
      ],
      'colon-user.test': [
        { user: 'name:one', password: 'pass' },
        { user: 'name', password: 'one:pass' }
      ]
    })

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, cache: false, ignoreEnvFile: true })],
      providers: [BooruAuthManagerService]
    }).compile()

    service = module.get<BooruAuthManagerService>(BooruAuthManagerService)
    service.onModuleInit()
  })

  afterEach(() => {
    if (originalAuthConfig === undefined) {
      delete process.env.BOORU_AUTH_CONFIG
      return
    }

    process.env.BOORU_AUTH_CONFIG = originalAuthConfig
  })

  it('should normalize rule34 aliases into canonical deduplicated domain config', () => {
    const stats = service.getCredentialStats()
    const rule34Stats = stats.find((stat) => stat.domain === 'rule34.xxx')

    expect(rule34Stats).toEqual({
      domain: 'rule34.xxx',
      total: 2,
      available: 2,
      disabled: 0,
      cooldown: 0,
      permanentDisabled: 0
    })
  })

  it('should keep non-aliased www domains separate from root domains', () => {
    const rootCredential = service.getAvailableCredential('https://gelbooru.com/index.php?page=dapi')
    const wwwCredential = service.getAvailableCredential('https://www.gelbooru.com/index.php?page=dapi')

    expect(rootCredential).toEqual({ user: 'gel-user', password: 'gel-pass' })
    expect(wwwCredential).toEqual({ user: 'www-gel-user', password: 'www-gel-pass' })
  })

  it('should resolve credentials for api.rule34.xxx using rule34.xxx auth pool', () => {
    const credential = service.getAvailableCredential('https://api.rule34.xxx/index.php?page=dapi')

    expect(credential).not.toBeNull()
    expect(['canonical-user', 'api-user']).toContain(credential!.user)
  })

  it('should resolve credentials when base endpoint uses uppercase protocol', () => {
    const credential = service.getAvailableCredential('HTTPS://API.RULE34.XXX/index.php?page=dapi')

    expect(credential).not.toBeNull()
    expect(['canonical-user', 'api-user']).toContain(credential!.user)
  })

  it('should normalize reported auth failures to canonical rule34 domain', () => {
    const selectedCredential = service.getAvailableCredential('https://rule34.xxx/index.php?page=dapi')

    expect(selectedCredential).not.toBeNull()

    service.reportAuthFailure({
      domain: 'https://api.rule34.xxx/index.php?page=dapi',
      user: selectedCredential!.user,
      error: 'HTTP 403',
      timestamp: new Date()
    })

    const disabledCredentials = service.getDisabledCredentials()

    expect(
      disabledCredentials.some((cred) => cred.domain === 'rule34.xxx' && cred.user === selectedCredential!.user)
    ).toBe(true)
  })

  it('should redact sensitive auth params in auth failure logs', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined)

    service.reportAuthFailure({
      domain: 'https://www.gelbooru.com/index.php?page=dapi',
      user: 'www-gel-user',
      password: 'www-gel-pass',
      error:
        'HTTP 403: Forbidden for https://www.gelbooru.com/index.php?page=dapi&auth_user=www-gel-user&auth_pass=secret123',
      timestamp: new Date()
    })

    const loggedMessage = errorSpy.mock.calls[0][0]

    expect(loggedMessage).toContain('auth_user=REDACTED')
    expect(loggedMessage).toContain('auth_pass=REDACTED')
    expect(loggedMessage).not.toContain('auth_pass=secret123')
    expect(loggedMessage).not.toContain('www-gel-user')

    errorSpy.mockRestore()
    warnSpy.mockRestore()
  })

  it('should redact sensitive key=value pairs outside of URLs in auth failure logs', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined)

    service.reportAuthFailure({
      domain: 'https://www.gelbooru.com/index.php?page=dapi',
      user: 'www-gel-user',
      password: 'www-gel-pass',
      error:
        'HTTP 403: Forbidden auth_user=www-gel-user auth_pass=secret123 token=abc123 api_key=xyz789 user_id=42 key=plain-key limit=10',
      timestamp: new Date()
    })

    const loggedMessage = errorSpy.mock.calls[0][0]

    expect(loggedMessage).toContain('auth_user=REDACTED')
    expect(loggedMessage).toContain('auth_pass=REDACTED')
    expect(loggedMessage).toContain('token=REDACTED')
    expect(loggedMessage).toContain('api_key=REDACTED')
    expect(loggedMessage).toContain('user_id=REDACTED')
    expect(loggedMessage).toContain('key=REDACTED')
    expect(loggedMessage).toContain('limit=10')
    expect(loggedMessage).not.toContain('www-gel-user')
    expect(loggedMessage).not.toContain('secret123')
    expect(loggedMessage).not.toContain('abc123')
    expect(loggedMessage).not.toContain('xyz789')
    expect(loggedMessage).not.toContain('plain-key')

    errorSpy.mockRestore()
    warnSpy.mockRestore()
  })

  it('should redact malformed uppercase-protocol URLs in auth failure logs', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined)

    service.reportAuthFailure({
      domain: 'https://www.gelbooru.com/index.php?page=dapi',
      user: 'www-gel-user',
      password: 'www-gel-pass',
      error: 'HTTP 403: Forbidden for HTTPS://%ZZ?page=dapi&AUTH_USER=www-gel-user&AUTH_PASS=secret123&limit=10',
      timestamp: new Date()
    })

    const loggedMessage = errorSpy.mock.calls[0][0]

    expect(loggedMessage).toContain('AUTH_USER=REDACTED')
    expect(loggedMessage).toContain('AUTH_PASS=REDACTED')
    expect(loggedMessage).not.toContain('AUTH_PASS=secret123')

    errorSpy.mockRestore()
    warnSpy.mockRestore()
  })

  it('should disable only matching same-user credential when password is provided', () => {
    service.reportAuthFailure({
      domain: 'same-user.test',
      user: 'shared-user',
      password: 'first-pass',
      error: 'HTTP 403',
      timestamp: new Date()
    })

    const stats = service.getCredentialStats()
    const sameUserStats = stats.find((stat) => stat.domain === 'same-user.test')

    expect(sameUserStats).toEqual({
      domain: 'same-user.test',
      total: 2,
      available: 1,
      disabled: 1,
      cooldown: 0,
      permanentDisabled: 1
    })
  })

  it('should disable all same-user credentials when password is missing', () => {
    service.reportAuthFailure({
      domain: 'same-user.test',
      user: 'shared-user',
      error: 'HTTP 403',
      timestamp: new Date()
    })

    const stats = service.getCredentialStats()
    const sameUserStats = stats.find((stat) => stat.domain === 'same-user.test')

    expect(sameUserStats).toEqual({
      domain: 'same-user.test',
      total: 2,
      available: 0,
      disabled: 2,
      cooldown: 0,
      permanentDisabled: 2
    })
  })

  it('should not collapse distinct credentials when user/password contain colons', () => {
    const stats = service.getCredentialStats()
    const colonStats = stats.find((stat) => stat.domain === 'colon-user.test')

    expect(colonStats).toEqual({
      domain: 'colon-user.test',
      total: 2,
      available: 2,
      disabled: 0,
      cooldown: 0,
      permanentDisabled: 0
    })
  })

  it('should parse disabled credentials when domain contains a colon', () => {
    service.reportAuthFailure({
      domain: 'invalid-domain:test',
      user: 'domain-user',
      password: 'domain-pass',
      error: 'HTTP 403',
      timestamp: new Date()
    })

    const disabledCredentials = service.getDisabledCredentials()

    expect(
      disabledCredentials.some(
        (credential) =>
          credential.domain === 'invalid-domain:test' &&
          credential.user === 'domain-user' &&
          credential.password === 'domain-pass'
      )
    ).toBe(true)
  })

  it('should apply cooldown state for rate-limited credentials', () => {
    service.reportAuthFailure({
      domain: 'https://www.gelbooru.com/index.php?page=dapi',
      user: 'www-gel-user',
      password: 'www-gel-pass',
      error: 'HTTP 429: Too Many Requests',
      failureKind: 'rate_limited',
      retryAfterSeconds: 30,
      timestamp: new Date()
    })

    const stats = service.getCredentialStats()
    const gelStats = stats.find((stat) => stat.domain === 'www.gelbooru.com')
    const disabledCredentials = service.getDisabledCredentials()

    expect(gelStats).toEqual({
      domain: 'www.gelbooru.com',
      total: 1,
      available: 0,
      disabled: 1,
      cooldown: 1,
      permanentDisabled: 0
    })

    expect(
      disabledCredentials.some(
        (credential) =>
          credential.domain === 'www.gelbooru.com' &&
          credential.user === 'www-gel-user' &&
          credential.state === 'cooldown' &&
          credential.cooldownUntil instanceof Date
      )
    ).toBe(true)
  })

  it('should reactivate credentials after cooldown expiration', () => {
    service.reportAuthFailure({
      domain: 'https://www.gelbooru.com/index.php?page=dapi',
      user: 'www-gel-user',
      password: 'www-gel-pass',
      error: 'HTTP 429: Too Many Requests',
      failureKind: 'rate_limited',
      retryAfterSeconds: 0,
      timestamp: new Date()
    })

    const selected = service.getAvailableCredential('https://www.gelbooru.com/index.php?page=dapi')

    expect(selected).toEqual({ user: 'www-gel-user', password: 'www-gel-pass' })
  })

  it('should expose minimum cooldown seconds for a domain', () => {
    service.reportAuthFailure({
      domain: 'https://www.gelbooru.com/index.php?page=dapi',
      user: 'www-gel-user',
      password: 'www-gel-pass',
      error: 'HTTP 429: Too Many Requests',
      failureKind: 'rate_limited',
      retryAfterSeconds: 45,
      timestamp: new Date()
    })

    const minCooldown = service.getMinCooldownSeconds('https://www.gelbooru.com/index.php?page=dapi')

    expect(minCooldown).toBeDefined()
    expect(minCooldown).toBeGreaterThan(0)
    expect(minCooldown).toBeLessThanOrEqual(45)
  })

  it('should return masked credential pool status snapshots', () => {
    service.reportAuthFailure({
      domain: 'https://gelbooru.com/index.php?page=dapi',
      user: 'gel-user',
      password: 'gel-pass',
      error: 'HTTP 403: Forbidden',
      failureKind: 'auth_forbidden',
      timestamp: new Date()
    })

    const snapshots = service.getCredentialPoolStatus('gelbooru.com')

    expect(snapshots).toHaveLength(1)
    expect(snapshots[0].domain).toBe('gelbooru.com')
    expect(snapshots[0].credentials[0].user).toMatch(/^REDACTED\(\d+\)$/)
    expect(snapshots[0].credentials[0].state).toBe('permanent')
    expect(snapshots[0].credentials[0].user).not.toContain('gel-user')
  })
})
