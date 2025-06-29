import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { BooruTypesStringEnum } from '@alejandroakbal/universal-booru-wrapper'
import { BooruService } from './booru.service'
import { booruQueriesDTO } from './dto/booru-queries.dto'
import { BooruEndpointParamsDTO } from './dto/request-booru.dto'

describe('BooruService', () => {
  let service: BooruService
  let configService: ConfigService

  const mockConfigService = {
    get: jest.fn()
  }

  const mockParams: BooruEndpointParamsDTO = {
    booruType: BooruTypesStringEnum.GELBOORU_COM
  }

  const baseQueries: Partial<booruQueriesDTO> = {
    baseEndpoint: 'https://gelbooru.com',
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooruService,
        {
          provide: ConfigService,
          useValue: mockConfigService
        }
      ]
    }).compile()

    service = module.get<BooruService>(BooruService)
    configService = module.get<ConfigService>(ConfigService)

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
      const envConfig = {
        'gelbooru.com': [{ user: 'env_user', password: 'env_pass' }]
      }
      mockConfigService.get.mockReturnValue(JSON.stringify(envConfig))

      // Test with no query params
      const queriesNoAuth = { ...baseQueries } as booruQueriesDTO
      const apiNoAuth = service.buildApiClass(mockParams, queriesNoAuth)

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
      const envConfig = {
        'gelbooru.com': [{ user: 'env_user', password: 'env_pass' }]
      }
      mockConfigService.get.mockReturnValue(JSON.stringify(envConfig))

      const queries = {
        ...baseQueries,
        auth_user: 'query_user',
        auth_pass: 'query_pass'
      } as booruQueriesDTO

      const api = service.buildApiClass(mockParams, queries)

      // Should use query credentials, not env credentials
      expect((api as any).options?.auth?.username).toBe('query_user')
      expect((api as any).options?.auth?.apiKey).toBe('query_pass')
    })

    it('should create API without authentication when no credentials are available', () => {
      mockConfigService.get.mockReturnValue(undefined)

      const queries = { ...baseQueries } as booruQueriesDTO
      const api = service.buildApiClass(mockParams, queries)

      expect((api as any).options?.auth?.username).toBeUndefined()
      expect((api as any).options?.auth?.apiKey).toBeUndefined()
    })

    it('should use first credential when multiple environment credentials exist', () => {
      const envConfig = {
        'gelbooru.com': [
          { user: 'first_user', password: 'first_pass' },
          { user: 'second_user', password: 'second_pass' }
        ]
      }
      mockConfigService.get.mockReturnValue(JSON.stringify(envConfig))

      const queries = { ...baseQueries } as booruQueriesDTO
      const api = service.buildApiClass(mockParams, queries)

      expect((api as any).options?.auth?.username).toBe('first_user')
      expect((api as any).options?.auth?.apiKey).toBe('first_pass')
    })

    it('should handle malformed environment configuration gracefully', () => {
      mockConfigService.get.mockReturnValue('invalid-json{')

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      const queries = { ...baseQueries } as booruQueriesDTO
      const api = service.buildApiClass(mockParams, queries)

      expect(consoleSpy).toHaveBeenCalledWith('Failed to parse BOORU_AUTH_CONFIG:', expect.any(String))
      expect((api as any).options?.auth?.username).toBeUndefined()
      expect((api as any).options?.auth?.apiKey).toBeUndefined()

      consoleSpy.mockRestore()
    })
  })
})
