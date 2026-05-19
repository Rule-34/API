import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { BooruTypesStringEnum, HttpError } from '@alejandroakbal/universal-booru-wrapper'
import { BooruService, ManagedCredentialPoolUnavailableError } from './booru.service'
import { booruQueriesDTO } from './dto/booru-queries.dto'
import { BooruEndpointParamsDTO } from './dto/request-booru.dto'
import { BooruAuthManagerService } from './services/booru-auth-manager.service'

interface MockAuthManager {
  getAvailableCredential: jest.MockedFunction<BooruAuthManagerService['getAvailableCredential']>
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
    mockAuthManager = {
      getAvailableCredential: jest.fn() as jest.MockedFunction<BooruAuthManagerService['getAvailableCredential']>,
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

    jest.clearAllMocks()

    mockAuthManager.getDomainStats.mockReturnValue({
      domain: 'gelbooru.com',
      total: 1,
      available: 1,
      disabled: 0,
      cooldown: 0,
      permanentDisabled: 0
    })
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

    it('should fallback to environment variables when query parameters are missing or incomplete', () => {
      mockAuthManager.getAvailableCredential.mockReturnValue({ user: 'env_user', password: 'env_pass' })

      // Test with no query params
      const queriesNoAuth = { ...baseQueries } as booruQueriesDTO
      const apiNoAuth = service.buildApiClass(mockParams, queriesNoAuth)

      expect(mockAuthManager.getAvailableCredential).toHaveBeenCalledWith('https://gelbooru.com')
      expect(getApiAuth(apiNoAuth)?.username).toBe('env_user')
      expect(getApiAuth(apiNoAuth)?.apiKey).toBe('env_pass')

      // Test with partial query params (should still use env)
      const queriesPartial = {
        ...baseQueries,
        auth_user: 'partial_user' // Missing auth_pass
      } as booruQueriesDTO
      const apiPartial = service.buildApiClass(mockParams, queriesPartial)

      expect(getApiAuth(apiPartial)?.username).toBe('env_user')
      expect(getApiAuth(apiPartial)?.apiKey).toBe('env_pass')
    })

    it('should prioritize query parameters over environment variables', () => {
      mockAuthManager.getAvailableCredential.mockReturnValue({ user: 'env_user', password: 'env_pass' })

      const queries = {
        ...baseQueries,
        auth_user: 'query_user',
        auth_pass: 'query_pass'
      } as booruQueriesDTO

      const api = service.buildApiClass(mockParams, queries)

      // Should use query credentials, not env credentials - auth manager should not be called
      expect(mockAuthManager.getAvailableCredential).not.toHaveBeenCalled()
      expect(getApiAuth(api)?.username).toBe('query_user')
      expect(getApiAuth(api)?.apiKey).toBe('query_pass')
    })

    it('should create API without authentication when no credentials are available', () => {
      mockAuthManager.getAvailableCredential.mockReturnValue(null)

      const queries = { ...baseQueries } as booruQueriesDTO
      const api = service.buildApiClass(mockParams, queries)

      expect(mockAuthManager.getAvailableCredential).toHaveBeenCalledWith('https://gelbooru.com')
      expect(getApiAuth(api)?.username).toBeUndefined()
      expect(getApiAuth(api)?.apiKey).toBeUndefined()
    })

    it('should use auth manager for credential selection', () => {
      mockAuthManager.getAvailableCredential.mockReturnValue({ user: 'managed_user', password: 'managed_pass' })

      const queries = { ...baseQueries } as booruQueriesDTO
      const api = service.buildApiClass(mockParams, queries)

      expect(mockAuthManager.getAvailableCredential).toHaveBeenCalledWith('https://gelbooru.com')
      expect(getApiAuth(api)?.username).toBe('managed_user')
      expect(getApiAuth(api)?.apiKey).toBe('managed_pass')
    })

    it('should expose selected credential metadata when building API with context', () => {
      mockAuthManager.getAvailableCredential.mockReturnValue({ user: 'managed_user', password: 'managed_pass' })

      const queries = { ...baseQueries } as booruQueriesDTO
      const result = service.buildApiWithContext(mockParams, queries)

      expect(getApiAuth(result.api)?.username).toBe('managed_user')
      expect(result.authResolution.source).toBe('env')
      expect(result.authResolution.selectedCredential).toEqual({
        user: 'managed_user',
        password: 'managed_pass'
      })
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
      expect(mockAuthManager.getAvailableCredential).not.toHaveBeenCalled()
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
      expect(mockAuthManager.getAvailableCredential).not.toHaveBeenCalled()
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

      mockAuthManager.getAvailableCredential
        .mockReturnValueOnce({ user: 'managed_1', password: 'pass_1' })
        .mockReturnValueOnce({ user: 'managed_2', password: 'pass_2' })

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

    it('should fallback to unauthenticated execution when no managed credentials are configured', async () => {
      mockAuthManager.getDomainStats.mockReturnValue({
        domain: 'rule34.paheal.net',
        total: 0,
        available: 0,
        disabled: 0,
        cooldown: 0,
        permanentDisabled: 0
      })
      mockAuthManager.getAvailableCredential.mockReturnValue(null)

      const queries = {
        ...baseQueries,
        baseEndpoint: 'https://rule34.paheal.net'
      } as booruQueriesDTO

      const operation = jest.fn().mockResolvedValue('ok-no-auth')

      const result = await service.executeWithAuthStrategy(mockParams, queries, operation)

      expect(result).toBe('ok-no-auth')
      expect(operation).toHaveBeenCalledTimes(1)
      expect(mockAuthManager.reportAuthFailure).not.toHaveBeenCalled()
      expect(mockAuthManager.getAvailableCredential).toHaveBeenCalledWith('https://rule34.paheal.net')
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
      mockAuthManager.getAvailableCredential.mockReturnValue(null)
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

      mockAuthManager.getAvailableCredential.mockReturnValue({ user: 'managed_1', password: 'pass_1' })

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
