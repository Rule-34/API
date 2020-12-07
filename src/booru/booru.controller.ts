import { Controller, Get, Param } from '@nestjs/common'
import {
  BooruTypesStringEnum,
} from '@alejandroakbal/universal-booru-wrapper'
import { BooruEndpointParamsDTO } from './dto/request-booru.dto'
function getAPIClassByType(booruType: BooruTypesStringEnum) {
  switch (booruType) {
    case BooruTypesStringEnum.GELBOORU:
      return Gelbooru

    case BooruTypesStringEnum.PAHEAL:
      return Paheal

    // Moebooru and MyImouto are danbooru
    case BooruTypesStringEnum.DANBOORU:
      return Danbooru

    case BooruTypesStringEnum.DANBOORU2:
      return Danbooru2

    case BooruTypesStringEnum.E621:
      return E621
  }
}

@Controller('booru')
export class BooruController {
  @Get(':booruType/:booruEndpoint')
  GetBooru(@Param() params: BooruEndpointParamsDTO) {
    return params
  }
}
