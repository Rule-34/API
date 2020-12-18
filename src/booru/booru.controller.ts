import { Controller, Get, Param, Query } from '@nestjs/common'
import { BooruEndpointParamsDTO } from './dto/request-booru.dto'
import { booruPostQueriesDTO } from './dto/booru-queries.dto'
import { BooruService } from './booru.service'
import {
  IBooruQueryValues,
  IBooruEndpoints,
  IBooruOptions,
} from '@alejandroakbal/universal-booru-wrapper'

@Controller('booru')
export class BooruController {
  private booruService: BooruService

  constructor(booruService: BooruService) {
    this.booruService = booruService
  }

  @Get(':booruType/posts')
  GetPosts(
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruPostQueriesDTO
  ) {
    const booruClass = this.booruService.getApiClassByType(params.booruType)

    const booruEndpoints = { base: queries.baseEndpoint }
    const booruOptions = { HTTPScheme: queries.HTTPScheme }

    const Api = new booruClass(
      booruEndpoints,
      undefined,
      undefined,
      booruOptions
    )

    const postQueryValues: IBooruQueryValues['posts'] = { tags: queries.tags }

    return Api.getPosts(postQueryValues)
    // return { params, queries }
  }
}
