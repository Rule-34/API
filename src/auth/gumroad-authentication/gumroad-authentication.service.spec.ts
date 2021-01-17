import { HttpException, HttpModule } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { GumroadAuthenticationService } from './gumroad-authentication.service'

describe('GumroadAuthenticationService', () => {
  let service: GumroadAuthenticationService
  let configService: ConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule.forRoot(), ConfigService],
      providers: [GumroadAuthenticationService],
    }).compile()

    service = module.get<GumroadAuthenticationService>(
      GumroadAuthenticationService
    )

    configService = module.get<ConfigService>(ConfigService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should verify a correct license', async () => {
    const productPermalink = configService.get<string>(
      'TEST_GUMROAD_AUTH_PRODUCT_PERMALINK'
    )
    const licenseKey = configService.get<string>(
      'TEST_GUMROAD_AUTH_LICENSE_KEY'
    )

    const data = await service.verifyLicense(
      productPermalink,
      licenseKey,
      false
    )

    expect(data.success).toBe(true)
  })

  it('should throw HttpException on incorrect license', async () => {
    const productPermalink = 'RandomString'
    const licenseKey = 'This-is-totally-invented'

    await expect(
      service.verifyLicense(productPermalink, licenseKey, false)
    ).rejects.toThrowError(HttpException)
  })
})
