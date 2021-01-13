import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common'
import { BooruEndpointParamsDTO } from './dto/request-booru.dto'
import {
  booruPostsQueriesDTO,
  booruSinglePostQueriesDTO,
} from './dto/booru-queries.dto'
import { BooruService } from './booru.service'
import { BooruErrorsInterceptor } from './filters/booru-exception.interceptor'
import { IBooruQueryValues } from '@alejandroakbal/universal-booru-wrapper'

@Controller('booru')
@UseInterceptors(BooruErrorsInterceptor)
export class BooruController {
  constructor(private readonly booruService: BooruService) {}

  @Get(':booruType/posts')
  GetPosts(
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruPostsQueriesDTO
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

    const postQueryValues: IBooruQueryValues['posts'] = {
      limit: queries.limit,
      pageID: queries.pageID,
      tags: queries.tags,
      rating: queries.rating,
      score: queries.score,
      order: queries.order,
    }

    return Api.getPosts(postQueryValues)
  }

  @Get(':booruType/single-post')
  GetSinglePost(
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruSinglePostQueriesDTO
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

    const postQueryValues: IBooruQueryValues['singlePost'] = {
      id: queries.id,
    }

    return Api.getSinglePost(postQueryValues)
  }
}
