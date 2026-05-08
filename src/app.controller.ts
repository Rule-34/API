import { Controller, Get, Query } from '@nestjs/common'
import { BooruAuthManagerService } from './booru/services/booru-auth-manager.service'

@Controller('/')
export class AppController {
  constructor(private readonly authManager: BooruAuthManagerService) {}

  @Get()
  GetStatusAsJson() {
    return { status: 'OK' }
  }

  @Get('status')
  GetStatusAsText() {
    return 'If you can read this, it means that the API is working. You can close this tab.'
  }

  @Get('internal/booru-auth/status')
  GetBooruCredentialStatus(@Query('domain') domain?: string) {

    return {
      status: 'OK',
      data: this.authManager.getCredentialPoolStatus(domain)
    }
  }
}
