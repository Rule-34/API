import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { BooruTypesStringEnum } from '@alejandroakbal/universal-booru-wrapper'
import { BooruService, ManagedCredentialPoolUnavailableError } from './booru.service'
import type { booruQueryValuesPostsDTO } from './dto/booru-queries.dto'
import { BooruAuthManagerService } from './services/booru-auth-manager.service'

const runLiveTests = process.env['RUN_BOORU_AUTH_LIVE_TESTS'] === 'true'
const describeLive = runLiveTests ? describe : describe.skip

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

        throw error
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
