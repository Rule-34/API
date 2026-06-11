import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { BooruTypesStringEnum } from '@alejandroakbal/universal-booru-wrapper'
import { BooruService, ManagedCredentialPoolUnavailableError } from './booru.service'
import type { booruQueryValuesPostsDTO } from './dto/booru-queries.dto'
import { BooruAuthManagerService } from './services/booru-auth-manager.service'
import { SENSITIVE_AUTH_PARAMS } from './constants/sensitive-auth-params'

const runLiveTests = process.env['RUN_BOORU_AUTH_LIVE_TESTS'] === 'true'
const describeLive = runLiveTests ? describe : describe.skip
const sensitiveAuthParams = SENSITIVE_AUTH_PARAMS

const liveBoorus: {
  domain: string
  booruType: BooruTypesStringEnum
  initialPageID: number
}[] = [
  {
    domain: 'gelbooru.com',
    booruType: BooruTypesStringEnum.GELBOORU_COM,
    initialPageID: 0
  },
  {
    domain: 'rule34.xxx',
    booruType: BooruTypesStringEnum.RULE_34_XXX,
    initialPageID: 0
  }
]

function sanitizeLiveSmokeErrorMessage(message: string): string {
  let sanitizedMessage = message

  for (const key of sensitiveAuthParams) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    sanitizedMessage = sanitizedMessage.replace(new RegExp(`([?&\\s]${escapedKey}=)[^\\s&#]+`, 'gi'), '$1REDACTED')
  }

  return sanitizedMessage
}

describe('live smoke error sanitization', () => {
  it('redacts auth query params before rethrowing non-quota live errors', () => {
    const message =
      'HTTP 403 https://gelbooru.com/index.php?page=dapi&api_key=secret&user_id=123 auth_user=user auth_pass=pass'

    const sanitizedMessage = sanitizeLiveSmokeErrorMessage(message)

    expect(sanitizedMessage).toContain('api_key=REDACTED')
    expect(sanitizedMessage).toContain('user_id=REDACTED')
    expect(sanitizedMessage).toContain('auth_user=REDACTED')
    expect(sanitizedMessage).toContain('auth_pass=REDACTED')
    expect(sanitizedMessage).not.toContain('secret')
    expect(sanitizedMessage).not.toContain('user_id=123')
    expect(sanitizedMessage).not.toContain('auth_pass=pass')
  })
})

describeLive('authenticated booru live smoke tests', () => {
  let module: TestingModule
  let service: BooruService

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, cache: false })],
      providers: [BooruService, BooruAuthManagerService, ConfigService]
    }).compile()

    service = module.get(BooruService)
    module.get(BooruAuthManagerService).onModuleInit()
  })

  afterAll(async () => {
    await module.close()
  })

  it.each(liveBoorus)(
    'returns normalized posts for $domain with configured auth',
    async (booru: (typeof liveBoorus)[number]) => {
      const queries = {
        baseEndpoint: booru.domain,
        limit: 1,
        pageID: booru.initialPageID
      } as booruQueryValuesPostsDTO

      let posts: { id?: unknown }[]

      try {
        posts = await service.executeWithAuthStrategy<{ id?: unknown }[]>(
          { booruType: booru.booruType },
          queries,
          (api) =>
            api.getPosts({
              limit: 1,
              pageID: booru.initialPageID
            })
        )
      } catch (error) {
        if (error instanceof ManagedCredentialPoolUnavailableError && error.reason === 'cooldown_exhausted') {
          console.warn(
            JSON.stringify({
              domain: booru.domain,
              booruType: booru.booruType,
              status: 'quota_exhausted',
              retryAfterSeconds: error.retryAfterSeconds
            })
          )
          return
        }

        const message = error instanceof Error ? error.message : String(error)
        const sanitizedMessage = sanitizeLiveSmokeErrorMessage(message)

        if (error instanceof Error) {
          error.message = sanitizedMessage

          if (error.stack !== undefined) {
            error.stack = sanitizeLiveSmokeErrorMessage(error.stack)
          }
        }

        throw new Error(sanitizedMessage, { cause: error })
      }

      expect(posts.length).toBeGreaterThan(0)

      const firstPost = posts[0]

      expect(firstPost?.id).toBeDefined()

      console.log(
        JSON.stringify({
          domain: booru.domain,
          booruType: booru.booruType,
          itemCount: posts.length
        })
      )
    }
  )
})
