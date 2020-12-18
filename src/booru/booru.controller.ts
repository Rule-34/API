import { Controller, Get, Param, Query } from '@nestjs/common'
import { BooruEndpointParamsDTO } from './dto/request-booru.dto'
import { booruOptionsDTO } from './dto/booru-queries.dto'
import { BooruService } from './booru.service'

@Controller('booru')
export class BooruController {
  private booruService: BooruService

  constructor(booruService: BooruService) {
    this.booruService = booruService
  }

  @Get(':booruType/posts')
  GetPosts(
    @Param() params: BooruEndpointParamsDTO,
    @Query() queries: booruOptionsDTO
  ) {
    const booruClass = this.booruService.getApiClassByType(params.booruType)

    const Api = new booruClass({ base: queries.baseEndpoint })

    // return Api.getPosts()
    return { params, queries }
  }
}
