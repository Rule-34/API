import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { BooruTypesStringEnum } from '@alejandroakbal/universal-booru-wrapper'
import { BooruService } from './booru.service'
import { booruQueriesDTO } from './dto/booru-queries.dto'
import { BooruEndpointParamsDTO } from './dto/request-booru.dto'
import { BooruAuthManagerService } from './services/booru-auth-manager.service'

describe('BooruService', () => {
  let service: BooruService
  let mockAuthManager: any

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
      getAvailableCredential: jest.fn()
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
  })

  describe('Authentication Resolution', () => {
    it('should use query parameters when both auth_user and auth_pass are provided', () => {
      const queries = {
        ...baseQueries,
        auth_user: 'query_user',
        auth_pass: 'query_pass'
      } as booruQueriesDTO

      const api = service.buildApiClass(mockParams, queries)

      expect((api as any).options?.auth?.username).toBe('query_user')
      expect((api as any).options?.auth?.apiKey).toBe('query_pass')
    })

    it('should fallback to environment variables when query parameters are missing or incomplete', () => {
      mockAuthManager.getAvailableCredential.mockReturnValue({ user: 'env_user', password: 'env_pass' })

      // Test with no query params
      const queriesNoAuth = { ...baseQueries } as booruQueriesDTO
      const apiNoAuth = service.buildApiClass(mockParams, queriesNoAuth)

      expect(mockAuthManager.getAvailableCredential).toHaveBeenCalledWith('https://gelbooru.com')
      expect((apiNoAuth as any).options?.auth?.username).toBe('env_user')
      expect((apiNoAuth as any).options?.auth?.apiKey).toBe('env_pass')

      // Test with partial query params (should still use env)
      const queriesPartial = {
        ...baseQueries,
        auth_user: 'partial_user' // Missing auth_pass
      } as booruQueriesDTO
      const apiPartial = service.buildApiClass(mockParams, queriesPartial)

      expect((apiPartial as any).options?.auth?.username).toBe('env_user')
      expect((apiPartial as any).options?.auth?.apiKey).toBe('env_pass')
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
      expect((api as any).options?.auth?.username).toBe('query_user')
      expect((api as any).options?.auth?.apiKey).toBe('query_pass')
    })

    it('should create API without authentication when no credentials are available', () => {
      mockAuthManager.getAvailableCredential.mockReturnValue(null)

      const queries = { ...baseQueries } as booruQueriesDTO
      const api = service.buildApiClass(mockParams, queries)

      expect(mockAuthManager.getAvailableCredential).toHaveBeenCalledWith('https://gelbooru.com')
      expect((api as any).options?.auth?.username).toBeUndefined()
      expect((api as any).options?.auth?.apiKey).toBeUndefined()
    })

    it('should use auth manager for credential selection', () => {
      mockAuthManager.getAvailableCredential.mockReturnValue({ user: 'managed_user', password: 'managed_pass' })

      const queries = { ...baseQueries } as booruQueriesDTO
      const api = service.buildApiClass(mockParams, queries)

      expect(mockAuthManager.getAvailableCredential).toHaveBeenCalledWith('https://gelbooru.com')
      expect((api as any).options?.auth?.username).toBe('managed_user')
      expect((api as any).options?.auth?.apiKey).toBe('managed_pass')
    })


  })
})
