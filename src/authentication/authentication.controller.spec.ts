import { UnauthorizedException } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { UsersModule } from '../users/users.module'
import { AuthenticationController } from './authentication.controller'
import { AuthenticationService } from './authentication.service'

describe('AuthenticationController', () => {
  let controller: AuthenticationController
  let configService: ConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        UsersModule,
        JwtModule.registerAsync({
          imports: [ConfigModule.forRoot()],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: {
              expiresIn: configService.get<string>('JWT_EXPIRATION_TIME')
            }
          })
        })
      ],
      controllers: [AuthenticationController],
      providers: [AuthenticationService]
    }).compile()

    controller = module.get<AuthenticationController>(AuthenticationController)

    configService = module.get<ConfigService>(ConfigService)
  })

  it('should be defined', () => {
    expect.assertions(1)

    expect(controller).toBeDefined()
  })

  // TODO: Recreate this test
  // It doesnt currently work because this is a Unit test and it should be run as a E2E test.

  // describe('auth/profile', () => {
  //   it('should fail with no Bearer token', () => {
  //     expect.assertions(1)
  //
  //     expect(() => controller.profile({})).toThrowError(UnauthorizedException)
  //   })
  // })
})
