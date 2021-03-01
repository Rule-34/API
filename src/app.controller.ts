import { Controller, Get } from '@nestjs/common'

@Controller('/')
export class AppController {
  @Get()
  GetStatusAsJson() {
    return { status: 'OK' }
  }

  @Get('status')
  GetStatusAsText() {
    return 'OK'
  }
}
