import { EmptyDataError, IBooruQueryValues } from '@alejandroakbal/universal-booru-wrapper'
import { Controller, Get, Header, Param, Query, Request, UseInterceptors } from '@nestjs/common'
import { ResponseDto } from '../lib/dto/response.dto'
import { BooruService } from './booru.service'
import {
  booruQueryValuesPostsDTO,
  booruQueryValuesRandomPostsDTO,
  booruQueryValuesSinglePostDTO,
  booruQueryValuesTagsDTO
} from './dto/booru-queries.dto'
import { BooruEndpointParamsDTO } from './dto/request-booru.dto'
import { BooruErrorsInterceptor } from './interceptors/booru-exception.interceptor'

@Controller('booru')
@UseInterceptors(BooruErrorsInterceptor)
export class BooruController {
  constructor(private readonly booruService: BooruService) {}

  @Get(':booruType/posts')
  @Header('Cache-Control', 'public, max-age=250')
  async GetPosts(
    @Request()
    request,
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruQueryValuesPostsDTO
  ) {
    const Api = this.booruService.buildApiClass(params, queries)

    const postQueryValues: IBooruQueryValues['posts'] = {
      limit: queries.limit,
      pageID: queries.pageID,
      tags: queries.tags,
      rating: queries.rating,
      score: queries.score,
      order: queries.order
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    queries.pageID = queries.pageID ?? Api.booruType.initialPageID

    try {
      const posts = await Api.getPosts(postQueryValues)

      return ResponseDto.createFromController(request, queries, Api, posts)

      //
    } catch (error) {
      // TODO: Send a 204 status code
      if (error instanceof EmptyDataError) {
        return ResponseDto.createFromController(request, queries, Api, [])
      }

      throw error
    }
  }

  @Get(':booruType/random-posts')
  @Header('Cache-Control', 'no-cache')
  async GetRandomPosts(
    @Request()
    request,
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruQueryValuesRandomPostsDTO
  ) {
    const Api = this.booruService.buildApiClass(params, queries)

    const postQueryValues: IBooruQueryValues['randomPosts'] = {
      limit: queries.limit,
      pageID: queries.pageID,
      tags: queries.tags,
      rating: queries.rating,
      score: queries.score,
      order: queries.order
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    queries.pageID = queries.pageID ?? Api.booruType.initialPageID

    try {
      const posts = await Api.getRandomPosts(postQueryValues)

      return ResponseDto.createFromController(request, queries, Api, posts)

      //
    } catch (error) {
      // TODO: Send a 204 status code
      if (error instanceof EmptyDataError) {
        return ResponseDto.createFromController(request, queries, Api, [])
      }

      throw error
    }
  }

  @Get(':booruType/single-post')
  @Header('Cache-Control', 'public, max-age=604800, immutable')
  async GetSinglePost(
    @Request()
    request,
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruQueryValuesSinglePostDTO
  ) {
    const Api = this.booruService.buildApiClass(params, queries)

    const postQueryValues: IBooruQueryValues['singlePost'] = {
      id: queries.ID
    }

    const posts = await Api.getSinglePost(postQueryValues)

    return ResponseDto.createFromController(request, queries, Api, posts)
  }

  @Get(':booruType/tags')
  @Header('Cache-Control', 'public, max-age=3600')
  async GetTags(
    @Request()
    request,
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruQueryValuesTagsDTO
  ) {
    const Api = this.booruService.buildApiClass(params, queries)

    const postQueryValues: IBooruQueryValues['tags'] = {
      tag: queries.tag,
      tagEnding: queries.tagEnding,
      limit: queries.limit,
      pageID: queries.pageID,
      order: queries.order
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    queries.pageID = queries.pageID ?? Api.booruType.initialPageID

    try {
      const tags = await Api.getTags(postQueryValues)

      return ResponseDto.createFromController(request, queries, Api, tags)

      //
    } catch (error) {
      // TODO: Send a 204 status code
      if (error instanceof EmptyDataError) {
        return ResponseDto.createFromController(request, queries, Api, [])
      }

      throw error
    }
  }
}
