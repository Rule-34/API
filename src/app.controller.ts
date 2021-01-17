import { Controller, Get } from '@nestjs/common'

@Controller()
export class AppController {
  @Get('/')
  GetStatus() {
    return { status: 'OK' }
  }
}
