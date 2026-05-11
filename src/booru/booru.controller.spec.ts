import { Test, TestingModule } from '@nestjs/testing'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import request from 'supertest'
import { BooruController } from './booru.controller'
import { BooruService } from './booru.service'
import { BooruCacheControlInterceptor } from './interceptors/booru-cache-control.interceptor'
import { BooruErrorsInterceptor } from './interceptors/booru-exception.interceptor'
import { BooruAuthManagerService } from './services/booru-auth-manager.service'
import { createAppValidationPipe } from '../common/validation'
import { ResponseDto } from '../lib/dto/response.dto'
import { Reflector } from '@nestjs/core'
import { EmptyDataError } from '@alejandroakbal/universal-booru-wrapper'

describe('BooruController', () => {
  let app: NestFastifyApplication
  let mockBooruService: jest.Mocked<Partial<BooruService>>

  beforeEach(async () => {
    mockBooruService = {
      buildApiClass: jest.fn().mockReturnValue({
        booruType: { initialPageID: 0 }
      }),
      executeWithAuthStrategy: jest.fn().mockImplementation(async (_params, _queries, operation) => {
        const mockApi = {
          getPosts: jest.fn().mockResolvedValue([]),
          getRandomPosts: jest.fn().mockResolvedValue([]),
          getSinglePost: jest.fn().mockResolvedValue([]),
          getTags: jest.fn().mockResolvedValue([])
        }
        return operation(mockApi, { source: 'none' })
      })
    }

    jest.spyOn(ResponseDto, 'createFromController').mockReturnValue({
      data: [],
      meta: {
        items_count: 0,
        total_items: null,
        current_page: 0,
        total_pages: null,
        items_per_page: 0
      },
      links: {
        self: null,
        first: null,
        last: null,
        prev: null,
        next: null
      }
    } as any)

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooruController],
      providers: [
        { provide: BooruService, useValue: mockBooruService },
        BooruCacheControlInterceptor,
        BooruErrorsInterceptor,
        Reflector,
        { provide: BooruAuthManagerService, useValue: { reportAuthFailure: jest.fn() } }
      ]
    }).compile()

    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter())
    app.useGlobalPipes(createAppValidationPipe())
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  afterEach(async () => {
    await app.close()
    jest.restoreAllMocks()
  })

  describe('Cache-Control headers', () => {
    it('posts endpoint returns public cache header', async () => {
      const res = await request(app.getHttpServer())
        .get('/booru/gelbooru/posts')
        .query({ baseEndpoint: 'gelbooru.com' })

      expect(res.status).toBe(200)
      expect(res.headers['cache-control']).toBe(
        'public, max-age=300, s-maxage=14400, stale-while-revalidate=3600, stale-if-error=0'
      )
    })

    it('single-post endpoint returns public cache header', async () => {
      const res = await request(app.getHttpServer())
        .get('/booru/gelbooru/single-post')
        .query({ baseEndpoint: 'gelbooru.com' })

      expect(res.status).toBe(200)
      expect(res.headers['cache-control']).toBe(
        'public, max-age=21600, s-maxage=604800, stale-while-revalidate=86400, stale-if-error=0'
      )
    })

    it('tags endpoint returns public cache header', async () => {
      const res = await request(app.getHttpServer())
        .get('/booru/gelbooru/tags')
        .query({ baseEndpoint: 'gelbooru.com', tag: 'test' })

      expect(res.status).toBe(200)
      expect(res.headers['cache-control']).toBe(
        'public, max-age=21600, s-maxage=604800, stale-while-revalidate=86400, stale-if-error=0'
      )
    })

    it('random-posts endpoint returns no-store header', async () => {
      const res = await request(app.getHttpServer())
        .get('/booru/gelbooru/random-posts')
        .query({ baseEndpoint: 'gelbooru.com' })

      expect(res.status).toBe(200)
      expect(res.headers['cache-control']).toBe('no-store, no-cache, must-revalidate')
    })

    it('posts endpoint with auth returns private, no-store', async () => {
      mockBooruService.executeWithAuthStrategy = jest.fn().mockImplementation(async (_params, _queries, operation) => {
        const mockApi = { getPosts: jest.fn().mockResolvedValue([]) }
        return operation(mockApi, { source: 'query', selectedCredential: { user: 'u', password: 'p' } })
      })

      const res = await request(app.getHttpServer())
        .get('/booru/gelbooru/posts')
        .query({ baseEndpoint: 'gelbooru.com', auth_user: 'u', auth_pass: 'p' })

      expect(res.status).toBe(200)
      expect(res.headers['cache-control']).toBe('private, no-store')
    })

    it('posts endpoint with env auth keeps the public cache header', async () => {
      mockBooruService.executeWithAuthStrategy = jest.fn().mockImplementation(async (_params, _queries, operation) => {
        const mockApi = { getPosts: jest.fn().mockResolvedValue([]) }
        return operation(mockApi, { source: 'env', selectedCredential: { user: 'u', password: 'p' } })
      })

      const res = await request(app.getHttpServer())
        .get('/booru/gelbooru/posts')
        .query({ baseEndpoint: 'gelbooru.com' })

      expect(res.status).toBe(200)
      expect(res.headers['cache-control']).toBe(
        'public, max-age=300, s-maxage=14400, stale-while-revalidate=3600, stale-if-error=0'
      )
    })

    it('posts endpoint with partial auth query returns private, no-store', async () => {
      const res = await request(app.getHttpServer())
        .get('/booru/gelbooru/posts')
        .query({ baseEndpoint: 'gelbooru.com', auth_user: 'u' })

      expect(res.status).toBe(200)
      expect(res.headers['cache-control']).toBe('private, no-store')
    })

    it('posts endpoint keeps the public cache header for legitimate empty results', async () => {
      mockBooruService.executeWithAuthStrategy = jest.fn().mockImplementation(async (_params, _queries, operation) => {
        const mockApi = { getPosts: jest.fn().mockRejectedValue(new EmptyDataError()) }
        return operation(mockApi, { source: 'none' })
      })

      const res = await request(app.getHttpServer())
        .get('/booru/gelbooru/posts')
        .query({ baseEndpoint: 'gelbooru.com' })

      expect(res.status).toBe(200)
      expect(res.headers['cache-control']).toBe(
        'public, max-age=300, s-maxage=14400, stale-while-revalidate=3600, stale-if-error=0'
      )
    })

    it('posts endpoint with auth keeps empty results private and non-cacheable', async () => {
      mockBooruService.executeWithAuthStrategy = jest.fn().mockImplementation(async (_params, _queries, operation) => {
        const mockApi = { getPosts: jest.fn().mockRejectedValue(new EmptyDataError()) }
        return operation(mockApi, { source: 'query', selectedCredential: { user: 'u', password: 'p' } })
      })

      const res = await request(app.getHttpServer())
        .get('/booru/gelbooru/posts')
        .query({ baseEndpoint: 'gelbooru.com', auth_user: 'u', auth_pass: 'p' })

      expect(res.status).toBe(200)
      expect(res.headers['cache-control']).toBe('private, no-store')
    })

    it('single-post endpoint with auth returns private, no-store', async () => {
      mockBooruService.executeWithAuthStrategy = jest.fn().mockImplementation(async (_params, _queries, operation) => {
        const mockApi = { getSinglePost: jest.fn().mockResolvedValue([]) }
        return operation(mockApi, { source: 'query', selectedCredential: { user: 'u', password: 'p' } })
      })

      const res = await request(app.getHttpServer())
        .get('/booru/gelbooru/single-post')
        .query({ baseEndpoint: 'gelbooru.com', auth_user: 'u', auth_pass: 'p' })

      expect(res.status).toBe(200)
      expect(res.headers['cache-control']).toBe('private, no-store')
    })

    it('single-post not found returns the strict error cache header', async () => {
      mockBooruService.executeWithAuthStrategy = jest.fn().mockImplementation(async (_params, _queries, operation) => {
        const mockApi = { getSinglePost: jest.fn().mockRejectedValue(new EmptyDataError()) }
        return operation(mockApi, { source: 'none' })
      })

      const res = await request(app.getHttpServer())
        .get('/booru/gelbooru/single-post')
        .query({ baseEndpoint: 'gelbooru.com', ID: 1 })

      expect(res.status).toBe(404)
      expect(res.headers['cache-control']).toBe('no-store, no-cache, must-revalidate')
    })

    it('tags endpoint with auth returns private, no-store', async () => {
      mockBooruService.executeWithAuthStrategy = jest.fn().mockImplementation(async (_params, _queries, operation) => {
        const mockApi = { getTags: jest.fn().mockResolvedValue([]) }
        return operation(mockApi, { source: 'query', selectedCredential: { user: 'u', password: 'p' } })
      })

      const res = await request(app.getHttpServer())
        .get('/booru/gelbooru/tags')
        .query({ baseEndpoint: 'gelbooru.com', tag: 'test', auth_user: 'u', auth_pass: 'p' })

      expect(res.status).toBe(200)
      expect(res.headers['cache-control']).toBe('private, no-store')
    })

    it('random-posts endpoint with auth returns private, no-store', async () => {
      mockBooruService.executeWithAuthStrategy = jest.fn().mockImplementation(async (_params, _queries, operation) => {
        const mockApi = { getRandomPosts: jest.fn().mockResolvedValue([]) }
        return operation(mockApi, { source: 'query', selectedCredential: { user: 'u', password: 'p' } })
      })

      const res = await request(app.getHttpServer())
        .get('/booru/gelbooru/random-posts')
        .query({ baseEndpoint: 'gelbooru.com', auth_user: 'u', auth_pass: 'p' })

      expect(res.status).toBe(200)
      expect(res.headers['cache-control']).toBe('private, no-store')
    })
  })
})
