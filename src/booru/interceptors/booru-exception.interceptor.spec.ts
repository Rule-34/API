import { Test, TestingModule } from '@nestjs/testing'
import { ConfigModule } from '@nestjs/config'
import { Controller, Get, Request, UseInterceptors } from '@nestjs/common'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import request from 'supertest'
import { EmptyDataError, HttpError } from '@alejandroakbal/universal-booru-wrapper'
import { BooruErrorsInterceptor } from './booru-exception.interceptor'
import { BooruAuthManagerService } from '../services/booru-auth-manager.service'
import { ManagedCredentialPoolUnavailableError } from '../booru.service'

interface TestRequestWithAuthContext {
  booruAuthContext?: {
    baseEndpoint: string
    source: string
    credential?: {
      user: string
      password: string
    }
  }
}

interface PoolUnavailableResponseBody {
  retryAfterSeconds?: number
  reason?: string
}

@Controller('test-booru-errors')
@UseInterceptors(BooruErrorsInterceptor)
class TestBooruErrorsController {
  @Get('empty')
  getEmpty() {
    throw new EmptyDataError(
      'Request failed for https://gelbooru.com/index.php?page=dapi&user_id=12345&api_key=secret123&limit=10'
    )
  }

  @Get('auth-failure')
  getAuthFailure() {
    const error = new HttpError({
      message: 'Forbidden for https://www.gelbooru.com/index.php?page=dapi&auth_user=www-gel-user&auth_pass=secret123',
      statusCode: 403,
      failureKind: 'auth_forbidden'
    })

    throw error
  }

  @Get('rate-limit')
  getRateLimit() {
    const error = new HttpError({
      message:
        'Too many requests for https://www.gelbooru.com/index.php?page=dapi&auth_user=www-gel-user&auth_pass=secret123',
      statusCode: 429,
      failureKind: 'rate_limited',
      retryAfterSeconds: 30
    })

    throw error
  }

  @Get('malformed-url')
  getMalformedUrl() {
    throw new EmptyDataError(
      'Request failed for https://%zz?page=dapi&auth_user=www-gel-user&auth_pass=secret123&limit=10'
    )
  }

  @Get('pool-unavailable')
  getPoolUnavailable() {
    throw new ManagedCredentialPoolUnavailableError(
      'https://www.gelbooru.com/index.php?page=dapi',
      'cooldown_exhausted',
      25
    )
  }

  @Get('managed-auth-failure')
  getManagedAuthFailure(@Request() request: TestRequestWithAuthContext) {
    request.booruAuthContext = {
      baseEndpoint: 'https://www.gelbooru.com/index.php?page=dapi',
      source: 'env',
      credential: {
        user: 'www-gel-user',
        password: 'www-gel-pass'
      }
    }

    throw new HttpError({
      message: 'Forbidden for https://www.gelbooru.com/index.php?page=dapi&auth_user=www-gel-user&auth_pass=secret123',
      statusCode: 403,
      failureKind: 'auth_forbidden'
    })
  }

  @Get('managed-none-auth-failure')
  getManagedNoneAuthFailure(@Request() request: TestRequestWithAuthContext) {
    request.booruAuthContext = {
      baseEndpoint: 'https://www.gelbooru.com/index.php?page=dapi',
      source: 'none'
    }

    throw new HttpError({
      message: 'Forbidden for https://www.gelbooru.com/index.php?page=dapi&auth_user=www-gel-user&auth_pass=secret123',
      statusCode: 403,
      failureKind: 'auth_forbidden'
    })
  }

  @Get('managed-query-auth-failure')
  getManagedQueryAuthFailure(@Request() request: TestRequestWithAuthContext) {
    request.booruAuthContext = {
      baseEndpoint: 'https://www.gelbooru.com/index.php?page=dapi',
      source: 'query',
      credential: {
        user: 'www-gel-user',
        password: 'www-gel-pass'
      }
    }

    throw new HttpError({
      message: 'Forbidden for https://www.gelbooru.com/index.php?page=dapi&auth_user=www-gel-user&auth_pass=secret123',
      statusCode: 403,
      failureKind: 'auth_forbidden'
    })
  }
}

describe('BooruErrorsInterceptor', () => {
  let app: NestFastifyApplication
  let authManager: BooruAuthManagerService

  const originalAuthConfig = process.env['BOORU_AUTH_CONFIG']

  beforeEach(async () => {
    process.env['BOORU_AUTH_CONFIG'] = JSON.stringify({
      'www.gelbooru.com': [{ user: 'www-gel-user', password: 'www-gel-pass' }]
    })

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, cache: false, ignoreEnvFile: true })],
      controllers: [TestBooruErrorsController],
      providers: [BooruErrorsInterceptor, BooruAuthManagerService]
    }).compile()

    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter())
    await app.init()
    await app.getHttpAdapter().getInstance().ready()

    authManager = app.get(BooruAuthManagerService)
  })

  afterEach(async () => {
    await app.close()
  })

  afterAll(() => {
    if (originalAuthConfig === undefined) {
      delete process.env['BOORU_AUTH_CONFIG']
      return
    }

    process.env['BOORU_AUTH_CONFIG'] = originalAuthConfig
  })

  it('should sanitize EmptyDataError responses from a real request', async () => {
    const response = await request(app.getHttpServer()).get('/test-booru-errors/empty')
    const body = JSON.stringify(response.body)

    expect(response.status).toBe(404)
    expect(body).toContain('user_id=REDACTED')
    expect(body).toContain('api_key=REDACTED')
    expect(body).toContain('limit=10')
    expect(body).not.toContain('12345')
    expect(body).not.toContain('secret123')
  })

  it('should report auth failures with preserved www subdomains from a real request', async () => {
    const response = await request(app.getHttpServer()).get('/test-booru-errors/auth-failure').query({
      baseEndpoint: 'https://www.gelbooru.com/index.php?page=dapi',
      auth_user: 'www-gel-user'
    })

    const disabledCredentials = authManager.getDisabledCredentials()
    const body = JSON.stringify(response.body)

    expect(response.status).toBe(401)
    expect(
      disabledCredentials.some(
        (credential) => credential.domain === 'www.gelbooru.com' && credential.user === 'www-gel-user'
      )
    ).toBe(true)
    expect(body).toContain('auth_user=REDACTED')
    expect(body).toContain('auth_pass=REDACTED')
    expect(body).not.toContain('www-gel-user')
    expect(body).not.toContain('secret123')
  })

  it('should map rate-limit errors to 429 and put the credential in cooldown', async () => {
    const response = await request(app.getHttpServer()).get('/test-booru-errors/rate-limit').query({
      baseEndpoint: 'https://www.gelbooru.com/index.php?page=dapi',
      auth_user: 'www-gel-user'
    })

    const disabledCredentials = authManager.getDisabledCredentials()

    expect(response.status).toBe(429)
    expect(response.headers['retry-after']).toBe('30')
    expect(
      disabledCredentials.some(
        (credential) =>
          credential.domain === 'www.gelbooru.com' &&
          credential.user === 'www-gel-user' &&
          credential.state === 'cooldown'
      )
    ).toBe(true)
  })

  it('should report auth failures when baseEndpoint protocol casing is uppercase', async () => {
    const response = await request(app.getHttpServer()).get('/test-booru-errors/auth-failure').query({
      baseEndpoint: 'HTTPS://WWW.GELBOORU.COM/index.php?page=dapi',
      auth_user: 'www-gel-user'
    })

    const disabledCredentials = authManager.getDisabledCredentials()

    expect(response.status).toBe(401)
    expect(
      disabledCredentials.some(
        (credential) => credential.domain === 'www.gelbooru.com' && credential.user === 'www-gel-user'
      )
    ).toBe(true)
  })

  it('should not throw when sanitizing malformed URLs in error messages', async () => {
    const response = await request(app.getHttpServer()).get('/test-booru-errors/malformed-url')
    const body = JSON.stringify(response.body)

    expect(response.status).toBe(404)
    expect(body).toContain('https://%zz?page=dapi&auth_user=REDACTED&auth_pass=REDACTED&limit=10')
    expect(body).not.toContain('secret123')
  })

  it('should map managed pool unavailable errors to 503 with retry metadata', async () => {
    const response = await request(app.getHttpServer()).get('/test-booru-errors/pool-unavailable')
    const body = response.body as unknown as PoolUnavailableResponseBody

    expect(response.status).toBe(503)
    expect(response.headers['retry-after']).toBe('25')
    expect(body.retryAfterSeconds).toBe(25)
    expect(body.reason).toBe('cooldown_exhausted')
  })

  it('should skip auth failure reporting when managed failures were handled by service', async () => {
    const response = await request(app.getHttpServer()).get('/test-booru-errors/managed-auth-failure')
    const disabledCredentials = authManager.getDisabledCredentials()

    expect(response.status).toBe(401)
    expect(disabledCredentials).toHaveLength(0)
  })

  it('should skip auth failure reporting when auth context source is none', async () => {
    const response = await request(app.getHttpServer()).get('/test-booru-errors/managed-none-auth-failure').query({
      auth_user: 'www-gel-user'
    })
    const disabledCredentials = authManager.getDisabledCredentials()

    expect(response.status).toBe(401)
    expect(disabledCredentials).toHaveLength(0)
  })

  it('should skip auth failure reporting when auth context source is query', async () => {
    const response = await request(app.getHttpServer()).get('/test-booru-errors/managed-query-auth-failure')
    const disabledCredentials = authManager.getDisabledCredentials()

    expect(response.status).toBe(401)
    expect(disabledCredentials).toHaveLength(0)
  })

  describe('Cache-Control on errors', () => {
    it('should set Cache-Control: no-store on EmptyDataError responses', async () => {
      const response = await request(app.getHttpServer()).get('/test-booru-errors/empty')
      expect(response.status).toBe(404)
      expect(response.headers['cache-control']).toBe('no-store, no-cache, must-revalidate')
    })

    it('should set Cache-Control: no-store on auth failure responses', async () => {
      const response = await request(app.getHttpServer()).get('/test-booru-errors/auth-failure').query({
        baseEndpoint: 'https://www.gelbooru.com/index.php?page=dapi',
        auth_user: 'www-gel-user'
      })
      expect(response.status).toBe(401)
      expect(response.headers['cache-control']).toBe('no-store, no-cache, must-revalidate')
    })

    it('should set Cache-Control: no-store on rate-limit responses', async () => {
      const response = await request(app.getHttpServer()).get('/test-booru-errors/rate-limit').query({
        baseEndpoint: 'https://www.gelbooru.com/index.php?page=dapi',
        auth_user: 'www-gel-user'
      })
      expect(response.status).toBe(429)
      expect(response.headers['cache-control']).toBe('no-store, no-cache, must-revalidate')
    })

    it('should set Cache-Control: no-store on pool unavailable responses', async () => {
      const response = await request(app.getHttpServer()).get('/test-booru-errors/pool-unavailable')
      expect(response.status).toBe(503)
      expect(response.headers['cache-control']).toBe('no-store, no-cache, must-revalidate')
    })
  })
})
