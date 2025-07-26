import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { BooruTypesStringEnum } from '@alejandroakbal/universal-booru-wrapper'
import { BooruService } from './booru.service'
import { booruQueriesDTO } from './dto/booru-queries.dto'
import { BooruEndpointParamsDTO } from './dto/request-booru.dto'

describe('BooruService', () => {
  let service: BooruService

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

    it('should randomly select from multiple environment credentials', () => {
      const envConfig = {
        'gelbooru.com': [
          { user: 'user_1', password: 'pass_1' },
          { user: 'user_2', password: 'pass_2' },
          { user: 'user_3', password: 'pass_3' }
        ]
      }
      mockConfigService.get.mockReturnValue(JSON.stringify(envConfig))

      const queries = { ...baseQueries } as booruQueriesDTO
      const usedCredentials = new Set<string>()

      // Make multiple requests to check random distribution
      for (let i = 0; i < 20; i++) {
        const api = service.buildApiClass(mockParams, queries)
        const username = (api as any).options?.auth?.username

        // Should be one of the configured users
        expect(['user_1', 'user_2', 'user_3']).toContain(username)
        usedCredentials.add(username)
      }

      // Over 20 requests, we should see some variety (not always the same credential)
      // With 3 credentials and 20 requests, probability of using only 1 is extremely low
      expect(usedCredentials.size).toBeGreaterThan(1)
    })

    it('should randomly select from credentials for different domains independently', () => {
      const envConfig = {
        'gelbooru.com': [
          { user: 'gel_user_1', password: 'gel_pass_1' },
          { user: 'gel_user_2', password: 'gel_pass_2' }
        ],
        'danbooru.donmai.us': [
          { user: 'dan_user_1', password: 'dan_pass_1' },
          { user: 'dan_user_2', password: 'dan_pass_2' }
        ]
      }
      mockConfigService.get.mockReturnValue(JSON.stringify(envConfig))

      const gelbooruQueries = { ...baseQueries, baseEndpoint: 'https://gelbooru.com' } as booruQueriesDTO
      const danbooruQueries = { ...baseQueries, baseEndpoint: 'https://danbooru.donmai.us' } as booruQueriesDTO
      const danbooruParams = { booruType: BooruTypesStringEnum.DANBOORU2 }

      // Test gelbooru domain uses gelbooru credentials
      const gelApi = service.buildApiClass(mockParams, gelbooruQueries)
      const gelUsername = (gelApi as any).options?.auth?.username
      expect(['gel_user_1', 'gel_user_2']).toContain(gelUsername)

      // Test danbooru domain uses danbooru credentials
      const danApi = service.buildApiClass(danbooruParams, danbooruQueries)
      const danUsername = (danApi as any).options?.auth?.username
      expect(['dan_user_1', 'dan_user_2']).toContain(danUsername)
    })

    it('should handle single credential without issues', () => {
      const envConfig = {
        'gelbooru.com': [{ user: 'single_user', password: 'single_pass' }]
      }
      mockConfigService.get.mockReturnValue(JSON.stringify(envConfig))

      const queries = { ...baseQueries } as booruQueriesDTO

      // Multiple requests should always use the single available credential
      for (let i = 0; i < 5; i++) {
        const api = service.buildApiClass(mockParams, queries)
        expect((api as any).options?.auth?.username).toBe('single_user')
        expect((api as any).options?.auth?.apiKey).toBe('single_pass')
      }
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
