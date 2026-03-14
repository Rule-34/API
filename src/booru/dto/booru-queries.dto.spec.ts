import { Controller, Get, Query } from '@nestjs/common'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import { createAppValidationPipe } from '../../common/validation'
import { booruQueryValuesPostsDTO } from './booru-queries.dto'

@Controller('dto-test')
class BooruQueriesTestController {
  @Get('posts')
  getPosts(@Query() queries: booruQueryValuesPostsDTO) {
    return { tags: queries.tags }
  }
}

describe('booruQueryValuesPostsDTO request handling', () => {
  let app: NestFastifyApplication

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [BooruQueriesTestController]
    }).compile()

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter())
    app.useGlobalPipes(createAppValidationPipe())

    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  afterEach(async () => {
    await app.close()
  })

  it('should rely on request parsing for percent-decoding and preserve comma OR-groups', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/dto-test/posts?baseEndpoint=gelbooru.com&tags=panty_%26_stocking_with_garterbelt%2Cblue_hair'
    })

    const body = JSON.parse(response.body)

    expect(response.statusCode).toBe(200)
    expect(body.tags).toEqual(['panty_&_stocking_with_garterbelt,blue_hair'])
  })

  it('should normalize repeated tags query params and keep each OR-group token intact', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/dto-test/posts?baseEndpoint=gelbooru.com&tags=artist%3Afoo%2Crating%3Asafe&tags=score%3A%3E100'
    })

    const body = JSON.parse(response.body)

    expect(response.statusCode).toBe(200)
    expect(body.tags).toEqual(['artist:foo,rating:safe', 'score:>100'])
  })

  it('should reject empty tags produced by repeated query params', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/dto-test/posts?baseEndpoint=gelbooru.com&tags=tag1&tags='
    })

    expect(response.statusCode).toBe(400)
    expect(response.body).toContain('tags should not contain')
  })
})
