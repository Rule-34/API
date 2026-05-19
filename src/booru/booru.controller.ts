import { EmptyDataError, IBooruQueryValues } from '@alejandroakbal/universal-booru-wrapper'
import { Controller, Get, Param, Query, Request, UseInterceptors } from '@nestjs/common'
import { ResponseDto } from '../lib/dto/response.dto'
import { BooruService } from './booru.service'
import { ResolvedAuthCredentials } from './booru.service'
import { BOORU_CACHE_CONTROL_POLICIES } from './constants/cache-control-policies'
import { BooruCachePolicy } from './decorators/booru-cache-policy.decorator'
import {
  booruQueryValuesPostsDTO,
  booruQueryValuesRandomPostsDTO,
  booruQueryValuesSinglePostDTO,
  booruQueryValuesTagsDTO
} from './dto/booru-queries.dto'
import { BooruEndpointParamsDTO } from './dto/request-booru.dto'
import type { BooruAuthContext, BooruHttpRequest } from './interfaces/booru-http.interface'
import { BooruCacheControlInterceptor } from './interceptors/booru-cache-control.interceptor'
import { BooruErrorsInterceptor } from './interceptors/booru-exception.interceptor'

// Successful responses use the route policy from BooruCacheControlInterceptor.
// Thrown responses are intentionally left to BooruErrorsInterceptor so they
// always fall back to the strict error cache policy.
@Controller('booru')
@UseInterceptors(BooruCacheControlInterceptor, BooruErrorsInterceptor)
export class BooruController {
  constructor(private readonly booruService: BooruService) {}

  private withEffectivePageId(queries: booruQueryValuesPostsDTO, pageID: number): booruQueryValuesPostsDTO
  private withEffectivePageId(queries: booruQueryValuesRandomPostsDTO, pageID: number): booruQueryValuesRandomPostsDTO
  private withEffectivePageId(queries: booruQueryValuesTagsDTO, pageID: number): booruQueryValuesTagsDTO
  private withEffectivePageId(
    queries: booruQueryValuesPostsDTO | booruQueryValuesRandomPostsDTO | booruQueryValuesTagsDTO,
    pageID: number
  ): booruQueryValuesPostsDTO | booruQueryValuesRandomPostsDTO | booruQueryValuesTagsDTO {
    if (queries instanceof booruQueryValuesRandomPostsDTO) {
      return Object.assign(new booruQueryValuesRandomPostsDTO(), queries, { pageID })
    }

    if (queries instanceof booruQueryValuesTagsDTO) {
      return Object.assign(new booruQueryValuesTagsDTO(), queries, { pageID })
    }

    return Object.assign(new booruQueryValuesPostsDTO(), queries, { pageID })
  }

  private attachAuthContext(
    request: BooruHttpRequest,
    baseEndpoint: string,
    authResolution: ResolvedAuthCredentials
  ): void {
    const authContext: BooruAuthContext = {
      baseEndpoint,
      source: authResolution.source
    }

    if (authResolution.selectedCredential) {
      authContext.credential = authResolution.selectedCredential
    }

    request.booruAuthContext = authContext
  }

  @Get(':booruType/posts')
  @BooruCachePolicy(BOORU_CACHE_CONTROL_POLICIES.POSTS)
  async GetPosts(
    @Request()
    request: BooruHttpRequest,
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruQueryValuesPostsDTO
  ) {
    const initialApi = this.booruService.buildApiClass(params, queries)
    const effectivePageId = queries.pageID ?? initialApi.booruType.initialPageID
    const responseQueries = this.withEffectivePageId(queries, effectivePageId)

    const postQueryValues: IBooruQueryValues['posts'] = {
      pageID: effectivePageId,
      ...(queries.limit !== undefined ? { limit: queries.limit } : {}),
      ...(queries.tags !== undefined ? { tags: queries.tags } : {}),
      ...(queries.rating !== undefined ? { rating: queries.rating } : {}),
      ...(queries.score !== undefined ? { score: queries.score } : {}),
      ...(queries.order !== undefined ? { order: queries.order } : {})
    }

    try {
      const posts = await this.booruService.executeWithAuthStrategy(params, queries, async (Api, authRes) => {
        this.attachAuthContext(request, queries.baseEndpoint, authRes)
        return Api.getPosts(postQueryValues)
      })

      return ResponseDto.createFromController(request, responseQueries, initialApi, posts)

      //
    } catch (error) {
      // TODO: Send a 204 status code
      if (error instanceof EmptyDataError) {
        return ResponseDto.createFromController(request, responseQueries, initialApi, [])
      }

      throw error
    }
  }

  @Get(':booruType/random-posts')
  @BooruCachePolicy(BOORU_CACHE_CONTROL_POLICIES.RANDOM_POSTS)
  async GetRandomPosts(
    @Request()
    request: BooruHttpRequest,
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruQueryValuesRandomPostsDTO
  ) {
    const initialApi = this.booruService.buildApiClass(params, queries)
    const effectivePageId = queries.pageID ?? initialApi.booruType.initialPageID
    const responseQueries = this.withEffectivePageId(queries, effectivePageId)

    const postQueryValues: IBooruQueryValues['randomPosts'] = {
      pageID: effectivePageId,
      ...(queries.limit !== undefined ? { limit: queries.limit } : {}),
      ...(queries.tags !== undefined ? { tags: queries.tags } : {}),
      ...(queries.rating !== undefined ? { rating: queries.rating } : {}),
      ...(queries.score !== undefined ? { score: queries.score } : {}),
      ...(queries.order !== undefined ? { order: queries.order } : {})
    }

    try {
      const posts = await this.booruService.executeWithAuthStrategy(params, queries, async (Api, authRes) => {
        this.attachAuthContext(request, queries.baseEndpoint, authRes)
        return Api.getRandomPosts(postQueryValues)
      })

      return ResponseDto.createFromController(request, responseQueries, initialApi, posts)

      //
    } catch (error) {
      // TODO: Send a 204 status code
      if (error instanceof EmptyDataError) {
        return ResponseDto.createFromController(request, responseQueries, initialApi, [])
      }

      throw error
    }
  }

  @Get(':booruType/single-post')
  @BooruCachePolicy(BOORU_CACHE_CONTROL_POLICIES.SINGLE_POST)
  async GetSinglePost(
    @Request()
    request: BooruHttpRequest,
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruQueryValuesSinglePostDTO
  ) {
    const postQueryValues: IBooruQueryValues['singlePost'] =
      queries.ID === undefined
        ? undefined
        : {
            id: queries.ID
          }

    const initialApi = this.booruService.buildApiClass(params, queries)

    const posts = await this.booruService.executeWithAuthStrategy(params, queries, async (Api, authRes) => {
      this.attachAuthContext(request, queries.baseEndpoint, authRes)
      return Api.getSinglePost(postQueryValues)
    })

    return ResponseDto.createFromController(request, queries, initialApi, posts)
  }

  @Get(':booruType/tags')
  @BooruCachePolicy(BOORU_CACHE_CONTROL_POLICIES.TAGS)
  async GetTags(
    @Request()
    request: BooruHttpRequest,
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruQueryValuesTagsDTO
  ) {
    const initialApi = this.booruService.buildApiClass(params, queries)
    const effectivePageId = queries.pageID ?? initialApi.booruType.initialPageID
    const responseQueries = this.withEffectivePageId(queries, effectivePageId)

    const postQueryValues: IBooruQueryValues['tags'] = {
      tag: queries.tag,
      pageID: effectivePageId,
      ...(queries.tagEnding !== undefined ? { tagEnding: queries.tagEnding } : {}),
      ...(queries.limit !== undefined ? { limit: queries.limit } : {}),
      ...(queries.order !== undefined ? { order: queries.order } : {})
    }

    try {
      const tags = await this.booruService.executeWithAuthStrategy(params, queries, async (Api, authRes) => {
        this.attachAuthContext(request, queries.baseEndpoint, authRes)
        return Api.getTags(postQueryValues)
      })

      return ResponseDto.createFromController(request, responseQueries, initialApi, tags)

      //
    } catch (error) {
      // TODO: Send a 204 status code
      if (error instanceof EmptyDataError) {
        return ResponseDto.createFromController(request, responseQueries, initialApi, [])
      }

      throw error
    }
  }
}
