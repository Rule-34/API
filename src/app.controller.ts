import { Controller, Get, Headers, Query, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BooruAuthManagerService } from './booru/services/booru-auth-manager.service'

@Controller('/')
export class AppController {
  constructor(
    private readonly configService: ConfigService,
    private readonly authManager: BooruAuthManagerService
  ) {}

  @Get()
  GetStatusAsJson() {
    return { status: 'OK' }
  }

  @Get('status')
  GetStatusAsText() {
    return 'If you can read this, it means that the API is working. You can close this tab.'
  }

  @Get('internal/booru-auth/status')
  GetBooruCredentialStatus(
    @Headers('x-internal-token') internalToken: string,
    @Query('domain') domain?: string
  ) {
    const expectedToken = this.configService.get<string>('BOORU_STATUS_TOKEN')

    if (!expectedToken || internalToken !== expectedToken) {
      throw new UnauthorizedException('Invalid internal token')
    }

    return {
      status: 'OK',
      data: this.authManager.getCredentialPoolStatus(domain)
    }
  }
}
