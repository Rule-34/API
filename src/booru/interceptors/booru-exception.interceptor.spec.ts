import { Test, TestingModule } from '@nestjs/testing'
import { ConfigModule } from '@nestjs/config'
import { Controller, Get, UseInterceptors } from '@nestjs/common'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import request from 'supertest'
import { EmptyDataError, HttpError } from '@alejandroakbal/universal-booru-wrapper'
import { BooruErrorsInterceptor } from './booru-exception.interceptor'
import { BooruAuthManagerService } from '../services/booru-auth-manager.service'

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
    const error = new HttpError(
      'Forbidden for https://www.gelbooru.com/index.php?page=dapi&auth_user=www-gel-user&auth_pass=secret123'
    )

    ;(error as any).statusCode = 403

    throw error
  }
}

describe('BooruErrorsInterceptor', () => {
  let app: NestFastifyApplication
  let authManager: BooruAuthManagerService

  const originalAuthConfig = process.env.BOORU_AUTH_CONFIG

  beforeEach(async () => {
    process.env.BOORU_AUTH_CONFIG = JSON.stringify({
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
      delete process.env.BOORU_AUTH_CONFIG
      return
    }

    process.env.BOORU_AUTH_CONFIG = originalAuthConfig
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
})
