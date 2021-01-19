import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common'
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
  @Header('Cache-Control', 'public, max-age=250')
  GetPosts(
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruPostsQueriesDTO
  ) {
    const Api = this.booruService.buildApiClass(params, queries)

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
  @Header('Cache-Control', 'no-cache')
  GetRandomPosts(
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruRandomPostsQueriesDTO
  ) {
    const Api = this.booruService.buildApiClass(params, queries)

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
  @Header('Cache-Control', 'public, max-age=604800, immutable')
  GetSinglePost(
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruSinglePostQueriesDTO
  ) {
    const Api = this.booruService.buildApiClass(params, queries)

    const postQueryValues: IBooruQueryValues['singlePost'] = {
      id: queries.id,
    }

    return Api.getSinglePost(postQueryValues)
  }

  @Get(':booruType/tags')
  @Header('Cache-Control', 'public, max-age=3600')
  GetTags(
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruTagsQueriesDTO
  ) {
    const Api = this.booruService.buildApiClass(params, queries)

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
