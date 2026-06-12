import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { BooruTypesStringEnum, HttpError } from '@alejandroakbal/universal-booru-wrapper'
import type { ManagedCredentialPoolUnavailableError } from './booru.service'
import { BooruService } from './booru.service'
import type { booruQueriesDTO } from './dto/booru-queries.dto'
import type { BooruEndpointParamsDTO } from './dto/request-booru.dto'
import { BooruAuthManagerService } from './services/booru-auth-manager.service'

interface MockAuthManager {
  reserveAvailableCredential: jest.MockedFunction<BooruAuthManagerService['reserveAvailableCredential']>
  getDomainStats: jest.MockedFunction<BooruAuthManagerService['getDomainStats']>
  reportAuthFailure: jest.MockedFunction<BooruAuthManagerService['reportAuthFailure']>
  getMinCooldownSeconds: jest.MockedFunction<BooruAuthManagerService['getMinCooldownSeconds']>
}

interface ApiAuth {
  username?: string
  apiKey?: string
}

interface ApiAuthOptions {
  options?: {
    auth?: ApiAuth
  }
}

function getApiAuth(api: unknown): ApiAuth | undefined {
  return (api as ApiAuthOptions).options?.auth
}

function buildPostUrl(api: unknown): URL {
  const internalApi = api as {
    generateEndpointUrl(endpoint: string): URL
    addPostQueries(url: URL, queries: { limit: number; pageID: number; tags: string[] }): URL
  }

  return internalApi.addPostQueries(internalApi.generateEndpointUrl('/index.php?page=dapi&s=post&q=index'), {
    limit: 1,
    pageID: 1,
    tags: ['diana']
  })
}

function buildTagUrl(api: unknown): URL {
  const internalApi = api as {
    generateEndpointUrl(endpoint: string): URL
    addTagsQueries(url: URL, queries: { tag: string; limit: number }): URL
  }

  return internalApi.addTagsQueries(internalApi.generateEndpointUrl('/index.php?page=dapi&s=tag&q=index'), {
    tag: 'dian',
    limit: 1
  })
}

describe('BooruService', () => {
  let service: BooruService
  let mockAuthManager: MockAuthManager

  const mockConfigService = {
    get: jest.fn()
  }

  const mockParams: BooruEndpointParamsDTO = {
    booruType: BooruTypesStringEnum.GELBOORU_COM
  }

  const baseQueries: Partial<booruQueriesDTO> = {
    baseEndpoint: 'https://gelbooru.com'
  }

  beforeEach(async () => {
    mockConfigService.get.mockReset()

    mockAuthManager = {
      reserveAvailableCredential: jest.fn() as jest.MockedFunction<
        BooruAuthManagerService['reserveAvailableCredential']
      >,
      getDomainStats: jest.fn() as jest.MockedFunction<BooruAuthManagerService['getDomainStats']>,
      reportAuthFailure: jest.fn() as jest.MockedFunction<BooruAuthManagerService['reportAuthFailure']>,
      getMinCooldownSeconds: jest.fn() as jest.MockedFunction<BooruAuthManagerService['getMinCooldownSeconds']>
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooruService,
        {
          provide: ConfigService,
          useValue: mockConfigService
        },
        {
          provide: BooruAuthManagerService,
          useValue: mockAuthManager
        }
      ]
    }).compile()

    service = module.get<BooruService>(BooruService)

    mockAuthManager.getDomainStats.mockReturnValue({
      domain: 'gelbooru.com',
      total: 1,
      available: 1,
      disabled: 0,
      cooldown: 0,
      permanentDisabled: 0
    })
    mockAuthManager.reserveAvailableCredential.mockResolvedValue({ user: 'managed_1', password: 'pass_1' })
  })

  describe('Authentication Resolution', () => {
    it('should use query parameters when both auth_user and auth_pass are provided', () => {
      const queries = {
        ...baseQueries,
        auth_user: 'query_user',
        auth_pass: 'query_pass'
      } as booruQueriesDTO

      const api = service.buildApiClass(mockParams, queries)

      expect(getApiAuth(api)?.username).toBe('query_user')
      expect(getApiAuth(api)?.apiKey).toBe('query_pass')
    })

    it('should not use managed credentials while building metadata APIs', () => {
      // Test with no query params
      const queriesNoAuth = { ...baseQueries } as booruQueriesDTO
      const apiNoAuth = service.buildApiClass(mockParams, queriesNoAuth)

      expect(getApiAuth(apiNoAuth)?.username).toBeUndefined()
      expect(getApiAuth(apiNoAuth)?.apiKey).toBeUndefined()

      // Test with partial query params (should still use env)
      const queriesPartial = {
        ...baseQueries,
        auth_user: 'partial_user' // Missing auth_pass
      } as booruQueriesDTO
      const apiPartial = service.buildApiClass(mockParams, queriesPartial)

      expect(getApiAuth(apiPartial)?.username).toBeUndefined()
      expect(getApiAuth(apiPartial)?.apiKey).toBeUndefined()
    })

    it('should use query parameters when building metadata APIs', () => {
      const queries = {
        ...baseQueries,
        auth_user: 'query_user',
        auth_pass: 'query_pass'
      } as booruQueriesDTO

      const api = service.buildApiClass(mockParams, queries)

      expect(getApiAuth(api)?.username).toBe('query_user')
      expect(getApiAuth(api)?.apiKey).toBe('query_pass')
    })

    it('should create metadata API without authentication when no query credentials are available', () => {
      const queries = { ...baseQueries } as booruQueriesDTO
      const api = service.buildApiClass(mockParams, queries)

      expect(getApiAuth(api)?.username).toBeUndefined()
      expect(getApiAuth(api)?.apiKey).toBeUndefined()
    })

    it('should expose selected credential metadata when building API with an auth override', () => {
      const queries = { ...baseQueries } as booruQueriesDTO
      const result = service.buildApiWithContext(mockParams, queries, {
        auth: { username: 'managed_user', apiKey: 'managed_pass' },
        source: 'env',
        selectedCredential: { user: 'managed_user', password: 'managed_pass' }
      })

      expect(getApiAuth(result.api)?.username).toBe('managed_user')
      expect(result.authResolution.source).toBe('env')
      expect(result.authResolution.selectedCredential).toEqual({
        user: 'managed_user',
        password: 'managed_pass'
      })
    })

    it('should not use managed credentials when building API context without an override', () => {
      const queries = { ...baseQueries } as booruQueriesDTO
      const result = service.buildApiWithContext(mockParams, queries)

      expect(result.authResolution.source).toBe('none')
      expect(getApiAuth(result.api)?.username).toBeUndefined()
      expect(getApiAuth(result.api)?.apiKey).toBeUndefined()
    })

    it('should expose query credential metadata when query auth is provided', () => {
      const queries = {
        ...baseQueries,
        auth_user: 'query_user',
        auth_pass: 'query_pass'
      } as booruQueriesDTO

      const result = service.buildApiWithContext(mockParams, queries)

      expect(result.authResolution.source).toBe('query')
      expect(result.authResolution.selectedCredential).toEqual({
        user: 'query_user',
        password: 'query_pass'
      })
    })
  })

  describe('Outbound Proxy Resolution', () => {
    it('should proxy configured provider URLs after query and auth parameters are applied', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'BOORU_OUTBOUND_PROXY_CONFIG') {
          return JSON.stringify({
            'gelbooru.com': {
              baseUrl: 'https://cors-proxy2.rule34.workers.dev/',
              targetParam: 'q'
            }
          })
        }

        return undefined
      })

      const queries = {
        ...baseQueries,
        baseEndpoint: 'gelbooru.com',
        auth_user: 'managed_1',
        auth_pass: 'pass_1'
      } as booruQueriesDTO

      const api = service.buildApiClass(mockParams, queries)
      const proxiedUrl = buildPostUrl(api)
      const upstreamUrl = new URL(proxiedUrl.searchParams.get('q') ?? '')

      expect(proxiedUrl.origin).toBe('https://cors-proxy2.rule34.workers.dev')
      expect(upstreamUrl.origin).toBe('https://gelbooru.com')
      expect(upstreamUrl.searchParams.get('limit')).toBe('1')
      expect(upstreamUrl.searchParams.get('pid')).toBe('1')
      expect(upstreamUrl.searchParams.get('tags')).toBe('diana')
      expect(upstreamUrl.searchParams.get('user_id')).toBe('managed_1')
      expect(upstreamUrl.searchParams.get('api_key')).toBe('pass_1')
    })

    it('should proxy configured provider tag URLs with the same policy', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'BOORU_OUTBOUND_PROXY_CONFIG') {
          return JSON.stringify({
            'gelbooru.com': {
              baseUrl: 'https://r34.app/api/cors-proxy/',
              targetParam: 'q'
            }
          })
        }

        return undefined
      })

      const queries = {
        ...baseQueries,
        baseEndpoint: 'gelbooru.com',
        auth_user: 'managed_1',
        auth_pass: 'pass_1'
      } as booruQueriesDTO

      const api = service.buildApiClass(mockParams, queries)
      const proxiedUrl = buildTagUrl(api)
      const upstreamUrl = new URL(proxiedUrl.searchParams.get('q') ?? '')

      expect(proxiedUrl.origin).toBe('https://r34.app')
      expect(proxiedUrl.pathname).toBe('/api/cors-proxy/')
      expect(upstreamUrl.origin).toBe('https://gelbooru.com')
      expect(upstreamUrl.searchParams.get('name_pattern')).toBe('dian%')
      expect(upstreamUrl.searchParams.get('limit')).toBe('1')
      expect(upstreamUrl.searchParams.get('user_id')).toBe('managed_1')
      expect(upstreamUrl.searchParams.get('api_key')).toBe('pass_1')
    })

    it('should leave unconfigured provider URLs direct', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'BOORU_OUTBOUND_PROXY_CONFIG') {
          return JSON.stringify({
            'rule34.xxx': {
              baseUrl: 'https://cors-proxy2.rule34.workers.dev/',
              targetParam: 'q'
            }
          })
        }

        return undefined
      })

      const queries = {
        ...baseQueries,
        baseEndpoint: 'gelbooru.com',
        auth_user: 'managed_1',
        auth_pass: 'pass_1'
      } as booruQueriesDTO

      const api = service.buildApiClass(mockParams, queries)
      const directUrl = buildPostUrl(api)

      expect(directUrl.origin).toBe('https://gelbooru.com')
      expect(directUrl.searchParams.get('q')).toBe('index')
      expect(directUrl.searchParams.get('user_id')).toBe('managed_1')
      expect(directUrl.searchParams.get('api_key')).toBe('pass_1')
    })

    it('should rotate through multiple configured provider proxies', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'BOORU_OUTBOUND_PROXY_CONFIG') {
          return JSON.stringify({
            'gelbooru.com': [
              {
                baseUrl: 'https://cors-proxy2.rule34.workers.dev/',
                targetParam: 'q'
              },
              {
                baseUrl: 'https://cors-proxy.refinedsoftware00.workers.dev/',
                targetParam: 'q'
              }
            ]
          })
        }

        return undefined
      })

      const queries = {
        ...baseQueries,
        baseEndpoint: 'gelbooru.com',
        auth_user: 'managed_1',
        auth_pass: 'pass_1'
      } as booruQueriesDTO

      const firstUrl = buildPostUrl(service.buildApiClass(mockParams, queries))
      const secondUrl = buildPostUrl(service.buildApiClass(mockParams, queries))
      const thirdUrl = buildPostUrl(service.buildApiClass(mockParams, queries))

      expect(firstUrl.origin).toBe('https://cors-proxy2.rule34.workers.dev')
      expect(secondUrl.origin).toBe('https://cors-proxy.refinedsoftware00.workers.dev')
      expect(thirdUrl.origin).toBe('https://cors-proxy2.rule34.workers.dev')
    })

    it('should not rotate proxies while building an API that never fetches', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'BOORU_OUTBOUND_PROXY_CONFIG') {
          return JSON.stringify({
            'gelbooru.com': [
              {
                baseUrl: 'https://cors-proxy2.rule34.workers.dev/',
                targetParam: 'q'
              },
              {
                baseUrl: 'https://cors-proxy.refinedsoftware00.workers.dev/',
                targetParam: 'q'
              }
            ]
          })
        }

        return undefined
      })

      const queries = {
        ...baseQueries,
        baseEndpoint: 'gelbooru.com',
        auth_user: 'managed_1',
        auth_pass: 'pass_1'
      } as booruQueriesDTO

      service.buildApiClass(mockParams, queries)
      const firstFetchedUrl = buildPostUrl(service.buildApiClass(mockParams, queries))
      const secondFetchedUrl = buildPostUrl(service.buildApiClass(mockParams, queries))

      expect(firstFetchedUrl.origin).toBe('https://cors-proxy2.rule34.workers.dev')
      expect(secondFetchedUrl.origin).toBe('https://cors-proxy.refinedsoftware00.workers.dev')
    })

    it('should reject invalid outbound proxy config shapes', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'BOORU_OUTBOUND_PROXY_CONFIG') {
          return JSON.stringify({
            'gelbooru.com': {
              baseUrl: 'not-a-url',
              targetParam: 'q'
            }
          })
        }

        return undefined
      })

      const queries = {
        ...baseQueries,
        baseEndpoint: 'gelbooru.com'
      } as booruQueriesDTO

      expect(() => service.buildApiClass(mockParams, queries)).toThrow(
        'Invalid BOORU_OUTBOUND_PROXY_CONFIG baseUrl for gelbooru.com'
      )
    })

    it('should reject plaintext outbound proxy URLs', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'BOORU_OUTBOUND_PROXY_CONFIG') {
          return JSON.stringify({
            'gelbooru.com': {
              baseUrl: 'http://cors-proxy.example.test/',
              targetParam: 'q'
            }
          })
        }

        return undefined
      })

      const queries = {
        ...baseQueries,
        baseEndpoint: 'gelbooru.com'
      } as booruQueriesDTO

      expect(() => service.buildApiClass(mockParams, queries)).toThrow(
        'Invalid BOORU_OUTBOUND_PROXY_CONFIG baseUrl for gelbooru.com'
      )
    })
  })

  describe('Managed Strategy Execution', () => {
    it('should not fallback when explicit auth is provided', async () => {
      const queries = {
        ...baseQueries,
        auth_user: 'explicit_user',
        auth_pass: 'explicit_pass'
      } as booruQueriesDTO
      const operation = jest.fn().mockResolvedValue('ok')

      const result = await service.executeWithAuthStrategy(mockParams, queries, operation)

      expect(result).toBe('ok')
      expect(mockAuthManager.reportAuthFailure).not.toHaveBeenCalled()
    })

    it('should retry with another managed credential after rate limit failure', async () => {
      mockAuthManager.getDomainStats.mockReturnValue({
        domain: 'gelbooru.com',
        total: 2,
        available: 2,
        disabled: 0,
        cooldown: 0,
        permanentDisabled: 0
      })

      mockAuthManager.reserveAvailableCredential
        .mockResolvedValueOnce({ user: 'managed_1', password: 'pass_1' })
        .mockResolvedValueOnce({ user: 'managed_2', password: 'pass_2' })

      const queries = { ...baseQueries } as booruQueriesDTO
      const operation = jest
        .fn()
        .mockImplementationOnce(() => {
          throw new HttpError({
            message: 'rate limited',
            statusCode: 429,
            failureKind: 'rate_limited',
            retryAfterSeconds: 30
          })
        })
        .mockResolvedValueOnce('ok')

      const result = await service.executeWithAuthStrategy(mockParams, queries, operation)

      expect(result).toBe('ok')
      expect(operation).toHaveBeenCalledTimes(2)
      expect(mockAuthManager.reportAuthFailure).toHaveBeenCalledTimes(1)
      expect(mockAuthManager.reportAuthFailure).toHaveBeenCalledWith(
        expect.objectContaining({
          user: 'managed_1',
          password: 'pass_1',
          failureKind: 'rate_limited',
          retryAfterSeconds: 30
        })
      )
    })

    it('should not collapse attempted credentials when usernames or passwords contain colons', async () => {
      mockAuthManager.getDomainStats.mockReturnValue({
        domain: 'gelbooru.com',
        total: 2,
        available: 2,
        disabled: 0,
        cooldown: 0,
        permanentDisabled: 0
      })

      mockAuthManager.reserveAvailableCredential
        .mockResolvedValueOnce({ user: 'name:one', password: 'pass' })
        .mockResolvedValueOnce({ user: 'name', password: 'one:pass' })

      const queries = { ...baseQueries } as booruQueriesDTO
      const operation = jest.fn().mockImplementation(() => {
        throw new HttpError({
          message: 'rate limited',
          statusCode: 429,
          failureKind: 'rate_limited'
        })
      })

      await expect(service.executeWithAuthStrategy(mockParams, queries, operation)).rejects.toEqual(
        expect.objectContaining<Partial<ManagedCredentialPoolUnavailableError>>({
          name: 'ManagedCredentialPoolUnavailableError'
        })
      )

      expect(operation).toHaveBeenCalledTimes(2)
      expect(mockAuthManager.reportAuthFailure).toHaveBeenCalledTimes(2)
    })

    it('should sanitize credential-bearing upstream errors before reporting managed auth failures', async () => {
      const queries = { ...baseQueries } as booruQueriesDTO
      const operation = jest.fn().mockImplementation(() => {
        throw new HttpError({
          message:
            'HTTP 429 for https://gelbooru.com/index.php?page=dapi&auth_user=managed_1&auth_pass=pass_1&api_key=secret-key&user_id=123',
          statusCode: 429,
          failureKind: 'rate_limited'
        })
      })

      await expect(service.executeWithAuthStrategy(mockParams, queries, operation)).rejects.toEqual(
        expect.objectContaining<Partial<ManagedCredentialPoolUnavailableError>>({
          name: 'ManagedCredentialPoolUnavailableError'
        })
      )

      const reportedError = mockAuthManager.reportAuthFailure.mock.calls[0]?.[0].error

      expect(reportedError).toContain('auth_user=REDACTED')
      expect(reportedError).toContain('auth_pass=REDACTED')
      expect(reportedError).toContain('api_key=REDACTED')
      expect(reportedError).toContain('user_id=REDACTED')
      expect(reportedError).not.toContain('managed_1')
      expect(reportedError).not.toContain('pass_1')
      expect(reportedError).not.toContain('secret-key')
    })

    it('should fallback to unauthenticated execution when no managed credentials are configured', async () => {
      mockAuthManager.getDomainStats.mockReturnValue({
        domain: 'rule34.paheal.net',
        total: 0,
        available: 0,
        disabled: 0,
        cooldown: 0,
        permanentDisabled: 0
      })
      mockAuthManager.reserveAvailableCredential.mockResolvedValue(null)

      const queries = {
        ...baseQueries,
        baseEndpoint: 'https://rule34.paheal.net'
      } as booruQueriesDTO

      const operation = jest.fn().mockResolvedValue('ok-no-auth')

      const result = await service.executeWithAuthStrategy(mockParams, queries, operation)

      expect(result).toBe('ok-no-auth')
      expect(operation).toHaveBeenCalledTimes(1)
      expect(mockAuthManager.reportAuthFailure).not.toHaveBeenCalled()
    })

    it('should throw pool unavailable error when managed credentials are exhausted', async () => {
      mockAuthManager.getDomainStats.mockReturnValue({
        domain: 'gelbooru.com',
        total: 1,
        available: 0,
        disabled: 1,
        cooldown: 1,
        permanentDisabled: 0
      })
      mockAuthManager.reserveAvailableCredential.mockResolvedValue(null)
      mockAuthManager.getMinCooldownSeconds.mockReturnValue(42)

      const queries = { ...baseQueries } as booruQueriesDTO

      await expect(service.executeWithAuthStrategy(mockParams, queries, async () => 'unused')).rejects.toEqual(
        expect.objectContaining<Partial<ManagedCredentialPoolUnavailableError>>({
          name: 'ManagedCredentialPoolUnavailableError',
          retryAfterSeconds: 42,
          reason: 'cooldown_exhausted'
        })
      )
    })

    it('should treat BOORU_MANAGED_RETRY_CAP as total attempt cap', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'BOORU_MANAGED_RETRY_CAP') {
          return '1'
        }

        return undefined
      })

      mockAuthManager.getDomainStats.mockReturnValue({
        domain: 'gelbooru.com',
        total: 3,
        available: 3,
        disabled: 0,
        cooldown: 0,
        permanentDisabled: 0
      })

      mockAuthManager.reserveAvailableCredential.mockResolvedValue({ user: 'managed_1', password: 'pass_1' })

      const queries = { ...baseQueries } as booruQueriesDTO
      const operation = jest.fn().mockImplementation(() => {
        throw new HttpError({
          message: 'rate limited',
          statusCode: 429,
          failureKind: 'rate_limited',
          retryAfterSeconds: 10
        })
      })

      await expect(service.executeWithAuthStrategy(mockParams, queries, operation)).rejects.toEqual(
        expect.objectContaining<Partial<ManagedCredentialPoolUnavailableError>>({
          name: 'ManagedCredentialPoolUnavailableError'
        })
      )

      expect(operation).toHaveBeenCalledTimes(1)
      expect(mockAuthManager.reportAuthFailure).toHaveBeenCalledTimes(1)
    })
  })
})
