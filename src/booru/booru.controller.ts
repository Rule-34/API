import {
  BooruTypesStringEnum,
  Danbooru,
  Danbooru2,
  E621,
  Gelbooru,
  Paheal,
} from '@alejandroakbal/universal-booru-wrapper'
import { Controller, Get, Param, Query } from '@nestjs/common'
import { BooruEndpointParamsDTO } from './dto/request-booru.dto'
import { booruOptionsDTO } from './dto/booru-queries.dto'

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
  @Get(':booruType/posts')
  GetPosts(
    @Param() params: BooruEndpointParamsDTO,
    @Query() queries: booruOptionsDTO
  ) {
    const ApiClass = getAPIClassByType(params.booruType)

    const Api = new ApiClass({ base: queries.baseEndpoint })

    // return Api.getPosts()
    return { params, queries }
  }
}
