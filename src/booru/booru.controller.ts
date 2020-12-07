import { Controller, Get, Param } from '@nestjs/common'
import {
  BooruTypesStringEnum,
} from '@alejandroakbal/universal-booru-wrapper'
import { BooruEndpointParamsDTO } from './dto/request-booru.dto'

@Controller('booru')
export class BooruController {
  @Get(':booruType/:booruEndpoint')
  GetBooru(@Param() params: BooruEndpointParamsDTO) {
    return params
  }
}
