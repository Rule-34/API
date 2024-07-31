import { Controller, Get } from '@nestjs/common'

@Controller('/')
export class AppController {
  @Get()
  GetStatusAsJson() {
    return { status: 'OK' }
  }

  @Get('status')
  GetStatusAsText() {
    return 'If you can read this, it means that the API is working. You can close this tab.'
  }
}
