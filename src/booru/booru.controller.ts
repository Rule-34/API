import { Controller, Get, Param } from '@nestjs/common'
import { BooruRequestParams } from './dto/request-booru.dto'

@Controller('booru')
export class BooruController {
  @Get(':booruType/:booruEndpoint')
  GetBooru(@Param() params: BooruRequestParams) {
    return params
  }
}
