import { EmptyDataError, IBooruQueryValues } from '@alejandroakbal/universal-booru-wrapper'
import { Controller, Get, Header, Param, Query, Request, UseInterceptors } from '@nestjs/common'
import { ResponseDto } from '../lib/dto/response.dto'
import { BooruService } from './booru.service'
import { ResolvedAuthCredentials } from './booru.service'
import {
  booruQueryValuesPostsDTO,
  booruQueryValuesRandomPostsDTO,
  booruQueryValuesSinglePostDTO,
  booruQueryValuesTagsDTO
} from './dto/booru-queries.dto'
import { BooruEndpointParamsDTO } from './dto/request-booru.dto'
import { BooruErrorsInterceptor } from './interceptors/booru-exception.interceptor'

interface BooruAuthContext {
  baseEndpoint: string
  credential?: { user: string; password: string }
  source: ResolvedAuthCredentials['source']
  handledByService: boolean
}

interface AuthContextRequest {
  booruAuthContext?: BooruAuthContext
}

@Controller('booru')
@UseInterceptors(BooruErrorsInterceptor)
export class BooruController {
  constructor(private readonly booruService: BooruService) {}

  private withEffectivePageId<T extends object>(queries: T, pageID: number): T {
    return Object.assign(Object.create(Object.getPrototypeOf(queries)), queries, { pageID })
  }

  private attachAuthContext(
    request: AuthContextRequest,
    baseEndpoint: string,
    authResolution: ResolvedAuthCredentials
  ): void {
    const authContext: BooruAuthContext = {
      baseEndpoint,
      credential: authResolution.selectedCredential,
      source: authResolution.source,
      handledByService: authResolution.source === 'env'
    }

    request.booruAuthContext = authContext
  }

  @Get(':booruType/posts')
  @Header('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600, stale-if-error=0') // 5 minutes, 1 hour
  async GetPosts(
    @Request()
    request,
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruQueryValuesPostsDTO
  ) {
    const initialApi = this.booruService.buildApiClass(params, queries)
    const effectivePageId = queries.pageID ?? initialApi.booruType.initialPageID
    const responseQueries = this.withEffectivePageId(queries, effectivePageId)

    const postQueryValues: IBooruQueryValues['posts'] = {
      limit: queries.limit,
      pageID: effectivePageId,
      tags: queries.tags,
      rating: queries.rating,
      score: queries.score,
      order: queries.order
    }

    try {
      const posts = await this.booruService.executeWithAuthStrategy(params, queries, async (Api, authResolution) => {
        this.attachAuthContext(request, queries.baseEndpoint, authResolution)
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
  @Header('Cache-Control', 'no-cache')
  async GetRandomPosts(
    @Request()
    request,
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruQueryValuesRandomPostsDTO
  ) {
    const initialApi = this.booruService.buildApiClass(params, queries)
    const effectivePageId = queries.pageID ?? initialApi.booruType.initialPageID
    const responseQueries = this.withEffectivePageId(queries, effectivePageId)

    const postQueryValues: IBooruQueryValues['randomPosts'] = {
      limit: queries.limit,
      pageID: effectivePageId,
      tags: queries.tags,
      rating: queries.rating,
      score: queries.score,
      order: queries.order
    }

    try {
      const posts = await this.booruService.executeWithAuthStrategy(params, queries, async (Api, authResolution) => {
        this.attachAuthContext(request, queries.baseEndpoint, authResolution)
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
  @Header('Cache-Control', 'public, max-age=604800, immutable') // 1 week
  async GetSinglePost(
    @Request()
    request,
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruQueryValuesSinglePostDTO
  ) {
    const postQueryValues: IBooruQueryValues['singlePost'] = {
      id: queries.ID
    }

    const initialApi = this.booruService.buildApiClass(params, queries)

    const posts = await this.booruService.executeWithAuthStrategy(params, queries, async (Api, authResolution) => {
      this.attachAuthContext(request, queries.baseEndpoint, authResolution)
      return Api.getSinglePost(postQueryValues)
    })

    return ResponseDto.createFromController(request, queries, initialApi, posts)
  }

  @Get(':booruType/tags')
  @Header('Cache-Control', 'public, max-age=86400, stale-while-revalidate=86400, stale-if-error=0') // 1 day, 1 day
  async GetTags(
    @Request()
    request,
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
      tagEnding: queries.tagEnding,
      limit: queries.limit,
      pageID: effectivePageId,
      order: queries.order
    }

    try {
      const tags = await this.booruService.executeWithAuthStrategy(params, queries, async (Api, authResolution) => {
        this.attachAuthContext(request, queries.baseEndpoint, authResolution)
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
