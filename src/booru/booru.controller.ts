import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common'
import { BooruEndpointParamsDTO } from './dto/request-booru.dto'
import {
  booruPostsQueriesDTO,
  booruRandomPostsQueriesDTO,
  booruSinglePostQueriesDTO,
  booruTagsQueriesDTO,
} from './dto/booru-queries.dto'
import { BooruService } from './booru.service'
import { BooruErrorsInterceptor } from './interceptors/booru-exception.interceptor'
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

  @Get(':booruType/random-posts')
  GetRandomPosts(
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruRandomPostsQueriesDTO
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

    const postQueryValues: IBooruQueryValues['randomPosts'] = {
      limit: queries.limit,
      pageID: queries.pageID,
      tags: queries.tags,
      rating: queries.rating,
      score: queries.score,
      order: queries.order,
    }

    return Api.getRandomPosts(postQueryValues)
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

  @Get(':booruType/tags')
  GetTags(
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruTagsQueriesDTO
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

    const postQueryValues: IBooruQueryValues['tags'] = {
      tag: queries.tag,
      tagEnding: queries.tagEnding,
      limit: queries.limit,
      pageID: queries.pageID,
      order: queries.order,
    }

    return Api.getTags(postQueryValues)
  }
}
