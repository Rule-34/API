import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { ConfigModule } from '@nestjs/config'
import { BooruAuthManagerService } from './booru-auth-manager.service'
import type {
  BooruAuthCredential,
  DisabledCredential,
  SerializedCooldownDisabledCredential
} from '../interfaces/auth-manager.interface'

interface AuthManagerPrivateAccess {
  disableCredentialLocally(credential: DisabledCredential): void
  reserveAvailableCredentialFromPrimary(domain: string): Promise<BooruAuthCredential | null>
}

describe('BooruAuthManagerService', () => {
  let service: BooruAuthManagerService

  const originalAuthConfig = process.env['BOORU_AUTH_CONFIG']

  beforeEach(async () => {
    process.env['BOORU_AUTH_CONFIG'] = JSON.stringify({
      'rule34.xxx': [{ user: 'canonical-user', password: 'canonical-pass' }],
      'api.rule34.xxx': [
        { user: 'canonical-user', password: 'canonical-pass' },
        { user: 'api-user', password: 'api-pass' }
      ],
      'gelbooru.com': [{ user: 'gel-user', password: 'gel-pass' }],
      'gelbooru-override.test': [
        { user: 'override-user', password: 'override-pass', rateLimit: { requests: 2, windowSeconds: 5 } }
      ],
      'www.gelbooru.com': [{ user: 'www-gel-user', password: 'www-gel-pass' }],
      'same-user.test': [
        { user: 'shared-user', password: 'first-pass' },
        { user: 'shared-user', password: 'second-pass' }
      ],
      'quota-round-robin.test': [
        { user: 'quota-user-1', password: 'quota-pass-1', rateLimit: { requests: 1, windowSeconds: 10 } },
        { user: 'quota-user-2', password: 'quota-pass-2', rateLimit: { requests: 2, windowSeconds: 10 } }
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
      delete process.env['BOORU_AUTH_CONFIG']
      return
    }

    process.env['BOORU_AUTH_CONFIG'] = originalAuthConfig
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

  it('should keep non-aliased www domains separate from root domains', async () => {
    const rootCredential = await service.reserveAvailableCredential('https://gelbooru.com/index.php?page=dapi')
    const wwwCredential = await service.reserveAvailableCredential('https://www.gelbooru.com/index.php?page=dapi')

    expect(rootCredential).toEqual({ user: 'gel-user', password: 'gel-pass' })
    expect(wwwCredential).toEqual({ user: 'www-gel-user', password: 'www-gel-pass' })
  })

  it('should resolve credentials for api.rule34.xxx using rule34.xxx auth pool', async () => {
    const credential = await service.reserveAvailableCredential('https://api.rule34.xxx/index.php?page=dapi')

    if (credential === null) {
      throw new Error('Expected a credential for api.rule34.xxx')
    }

    expect(['canonical-user', 'api-user']).toContain(credential.user)
  })

  it('should resolve credentials when base endpoint uses uppercase protocol', async () => {
    const credential = await service.reserveAvailableCredential('HTTPS://API.RULE34.XXX/index.php?page=dapi')

    if (credential === null) {
      throw new Error('Expected a credential for uppercase api.rule34.xxx')
    }

    expect(['canonical-user', 'api-user']).toContain(credential.user)
  })

  it('should normalize reported auth failures to canonical rule34 domain', async () => {
    const selectedCredential = await service.reserveAvailableCredential('https://rule34.xxx/index.php?page=dapi')

    if (selectedCredential === null) {
      throw new Error('Expected a credential for rule34.xxx')
    }

    service.reportAuthFailure({
      domain: 'https://api.rule34.xxx/index.php?page=dapi',
      user: selectedCredential.user,
      error: 'HTTP 403',
      timestamp: new Date()
    })

    const disabledCredentials = service.getDisabledCredentials()

    expect(
      disabledCredentials.some((cred) => cred.domain === 'rule34.xxx' && cred.user === selectedCredential.user)
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

    const loggedMessage = String(errorSpy.mock.calls.at(0)?.at(0) ?? '')

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

    const loggedMessage = String(errorSpy.mock.calls.at(0)?.at(0) ?? '')

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

    const loggedMessage = String(errorSpy.mock.calls.at(0)?.at(0) ?? '')

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
    const now = Date.now()

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
          credential.cooldownUntil instanceof Date &&
          Math.abs(credential.cooldownUntil.getTime() - (now + 30_000)) <= 1_000
      )
    ).toBe(true)
  })

  it('should use provider fallback cooldown when rate limit has no retry-after', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

    service.reportAuthFailure({
      domain: 'https://gelbooru.com/index.php?page=dapi',
      user: 'gel-user',
      password: 'gel-pass',
      error: 'HTTP 429: Too Many Requests',
      failureKind: 'rate_limited',
      timestamp: new Date()
    })

    const disabledCredential = service
      .getDisabledCredentials()
      .find((credential) => credential.domain === 'gelbooru.com' && credential.user === 'gel-user')

    expect(disabledCredential?.state).toBe('cooldown')

    if (disabledCredential?.state !== 'cooldown') {
      throw new Error('Expected cooldown credential')
    }

    expect(disabledCredential.cooldownUntil.getTime()).toBe(new Date('2026-01-01T00:00:01.000Z').getTime())

    jest.useRealTimers()
  })

  it('should reserve gelbooru credentials according to the provider per-key quota', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

    const reservations = []

    for (let i = 0; i < 10; i++) {
      reservations.push(await service.reserveAvailableCredential('gelbooru.com'))
    }

    const exhaustedReservation = await service.reserveAvailableCredential('gelbooru.com')

    expect(reservations.every((credential) => credential?.user === 'gel-user')).toBe(true)
    expect(exhaustedReservation).toBeNull()
    expect(service.getMinCooldownSeconds('gelbooru.com')).toBe(1)

    jest.advanceTimersByTime(1_001)

    expect(await service.reserveAvailableCredential('gelbooru.com')).toEqual({ user: 'gel-user', password: 'gel-pass' })

    jest.useRealTimers()
  })

  it('should expose quota-full credentials as cooldown in status snapshots', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

    for (let i = 0; i < 10; i++) {
      await service.reserveAvailableCredential('gelbooru.com')
    }

    const [snapshot] = service.getCredentialPoolStatus('gelbooru.com')
    const credential = snapshot?.credentials.at(0)

    expect(snapshot?.available).toBe(0)
    expect(snapshot?.cooldown).toBe(1)
    expect(credential).toEqual({
      user: 'gel-user',
      state: 'cooldown',
      cooldownUntil: '2026-01-01T00:00:01.000Z',
      secondsRemaining: 1,
      reason: 'quota_exhausted'
    })

    jest.useRealTimers()
  })

  it('should reserve rule34 credentials according to the provider per-key quota', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

    for (let i = 0; i < 120; i++) {
      expect(await service.reserveAvailableCredential('rule34.xxx')).not.toBeNull()
    }

    expect(await service.reserveAvailableCredential('rule34.xxx')).toBeNull()
    expect(service.getMinCooldownSeconds('rule34.xxx')).toBe(60)

    jest.advanceTimersByTime(60_001)

    expect(await service.reserveAvailableCredential('rule34.xxx')).not.toBeNull()

    jest.useRealTimers()
  })

  it('should use per-key quota overrides before domain defaults', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

    expect(await service.reserveAvailableCredential('gelbooru-override.test')).not.toBeNull()
    expect(await service.reserveAvailableCredential('gelbooru-override.test')).not.toBeNull()
    expect(await service.reserveAvailableCredential('gelbooru-override.test')).toBeNull()
    expect(service.getMinCooldownSeconds('gelbooru-override.test')).toBe(5)

    jest.useRealTimers()
  })

  it('should skip quota-full credentials and reserve another key', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

    await service.reserveAvailableCredential('quota-round-robin.test')

    const selectedCredential = await service.reserveAvailableCredential('quota-round-robin.test')

    expect(selectedCredential?.user).toBe('quota-user-2')

    jest.useRealTimers()
  })

  it('should reactivate credentials after cooldown expiration', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

    service.reportAuthFailure({
      domain: 'https://www.gelbooru.com/index.php?page=dapi',
      user: 'www-gel-user',
      password: 'www-gel-pass',
      error: 'HTTP 429: Too Many Requests',
      failureKind: 'rate_limited',
      retryAfterSeconds: 1,
      timestamp: new Date()
    })

    const selectedDuringCooldown = await service.reserveAvailableCredential(
      'https://www.gelbooru.com/index.php?page=dapi'
    )

    expect(selectedDuringCooldown).toBeNull()

    jest.advanceTimersByTime(1_100)

    const selectedAfterCooldown = await service.reserveAvailableCredential(
      'https://www.gelbooru.com/index.php?page=dapi'
    )

    expect(selectedAfterCooldown).toEqual({ user: 'www-gel-user', password: 'www-gel-pass' })

    jest.useRealTimers()
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

  it('should log low-availability transitions and normalization', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined)

    service.reportAuthFailure({
      domain: 'same-user.test',
      user: 'shared-user',
      password: 'first-pass',
      error: 'HTTP 429: Too Many Requests',
      failureKind: 'rate_limited',
      retryAfterSeconds: 1,
      timestamp: new Date()
    })

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Low credential availability for same-user.test'))

    jest.advanceTimersByTime(1_100)
    service.getDomainStats('same-user.test')

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('Credential availability normalized for same-user.test')
    )

    warnSpy.mockRestore()
    logSpy.mockRestore()
    jest.useRealTimers()
  })

  it('should handle IPC-serialized credentials where Dates become strings (regression: worker crash)', () => {
    // Simulate what happens when a DisabledCredential is sent via process.send():
    // JSON serialization converts Date objects to ISO strings.
    // The receiving worker must reconstruct them before calling disableCredentialLocally.
    const cooldownDate = new Date(Date.now() + 60_000)
    const original = {
      domain: 'rule34.xxx',
      user: 'canonical-user',
      password: 'canonical-pass',
      state: 'cooldown' as const,
      disabledAt: new Date(),
      cooldownUntil: cooldownDate,
      reason: 'HTTP 429'
    }

    // JSON roundtrip — same transformation as process.send() / IPC
    const serialized = JSON.parse(JSON.stringify(original)) as unknown as SerializedCooldownDisabledCredential

    // With fix: reconstruct Dates before calling disableCredentialLocally
    const reconstructed: DisabledCredential = {
      ...serialized,
      disabledAt: new Date(serialized.disabledAt),
      cooldownUntil: new Date(serialized.cooldownUntil)
    }

    // Should NOT throw — disabledAt.getTime() and cooldownUntil.getTime() must work
    expect(() => {
      const serviceWithPrivateAccess = service as unknown as AuthManagerPrivateAccess
      serviceWithPrivateAccess.disableCredentialLocally(reconstructed)
    }).not.toThrow()

    // Credential should be on cooldown (pool has 2 total due to api.rule34.xxx alias merge)
    const stats = service.getDomainStats('rule34.xxx')
    expect(stats.total).toBe(2)
    expect(stats.cooldown).toBe(1)
    expect(stats.available).toBe(1)
  })

  it('should not locally reserve credentials when primary worker reservation IPC times out', async () => {
    jest.useFakeTimers()
    const originalSend = Reflect.get(process, 'send') as typeof process.send
    const sendMock = jest.fn() as jest.MockedFunction<NonNullable<typeof process.send>>
    Reflect.set(process, 'send', sendMock)

    const reservation = (service as unknown as AuthManagerPrivateAccess).reserveAvailableCredentialFromPrimary(
      'gelbooru.com'
    )

    jest.advanceTimersByTime(1_001)

    await expect(reservation).resolves.toBeNull()
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'RESERVE_CREDENTIAL'
      })
    )
    expect(await service.reserveAvailableCredential('gelbooru.com')).toEqual({ user: 'gel-user', password: 'gel-pass' })

    if (originalSend === undefined) {
      Reflect.deleteProperty(process, 'send')
    } else {
      Reflect.set(process, 'send', originalSend)
    }
    jest.useRealTimers()
  })

  it('should throw when IPC-serialized Dates are used without reconstruction (proves original bug)', () => {
    // Without the fix, disableCredentialLocally receives string dates from IPC and crashes
    const serialized = JSON.parse(
      JSON.stringify({
        domain: 'rule34.xxx',
        user: 'canonical-user',
        password: 'canonical-pass',
        state: 'cooldown' as const,
        disabledAt: new Date(),
        cooldownUntil: new Date(Date.now() + 60_000),
        reason: 'HTTP 429'
      })
    ) as unknown as SerializedCooldownDisabledCredential

    // disabledAt and cooldownUntil are now strings — calling .getTime() on them throws
    expect(typeof serialized.disabledAt).toBe('string')
    expect(typeof serialized.cooldownUntil).toBe('string')
    expect(() => (serialized.disabledAt as unknown as { getTime: () => number }).getTime()).toThrow(TypeError)
    expect(() => (serialized.cooldownUntil as unknown as { getTime: () => number }).getTime()).toThrow(TypeError)
  })

  it('should return credential pool status snapshots', () => {
    service.reportAuthFailure({
      domain: 'https://gelbooru.com/index.php?page=dapi',
      user: 'gel-user',
      password: 'gel-pass',
      error: 'HTTP 403: Forbidden',
      failureKind: 'auth_forbidden',
      timestamp: new Date()
    })

    const snapshots = service.getCredentialPoolStatus('gelbooru.com')
    const snapshot = snapshots.at(0)
    const credential = snapshot?.credentials.at(0)

    expect(snapshots).toHaveLength(1)
    expect(snapshot?.domain).toBe('gelbooru.com')
    expect(credential?.user).toBe('gel-user')
    expect(credential?.state).toBe('permanent')
  })
})
