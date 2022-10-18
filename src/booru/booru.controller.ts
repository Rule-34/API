import { Controller, Get, Header, Param, Query, Request, UseGuards, UseInterceptors } from '@nestjs/common'
import { IBooruQueryValues } from '@alejandroakbal/universal-booru-wrapper'
import { BooruEndpointParamsDTO } from './dto/request-booru.dto'
import {
  booruQueryValuesPostsDTO,
  booruQueryValuesRandomPostsDTO,
  booruQueryValuesSinglePostDTO,
  booruQueryValuesTagsDTO
} from './dto/booru-queries.dto'
import { BooruService } from './booru.service'
import { BooruErrorsInterceptor } from './interceptors/booru-exception.interceptor'
import { UserData } from '../users/interfaces/users.interface'
import { JwtBooruGuard } from '../authentication/guards/jwt.guard'

@Controller('booru')
@UseInterceptors(BooruErrorsInterceptor)
export class BooruController {
  constructor(private readonly booruService: BooruService) {}

  @Get(':booruType/posts')
  @Header('Cache-Control', 'public, max-age=250')
  @UseGuards(JwtBooruGuard)
  GetPosts(
    @Request()
    request,
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruQueryValuesPostsDTO
  ) {
    const userData = request.user as UserData

    // Manually check because `JwtBooruAuthenticationGuard` is intentionally flawed
    if (!userData) {
      this.booruService.checkIfItsFromDefaultBooruList(queries.baseEndpoint)
    }

    const Api = this.booruService.buildApiClass(params, queries)

    const postQueryValues: IBooruQueryValues['posts'] = {
      limit: queries.limit,
      pageID: queries.pageID,
      tags: queries.tags,
      rating: queries.rating,
      score: queries.score,
      order: queries.order
    }

    return Api.getPosts(postQueryValues)
  }

  @Get(':booruType/random-posts')
  @Header('Cache-Control', 'no-cache')
  @UseGuards(JwtBooruGuard)
  GetRandomPosts(
    @Request()
    request,
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruQueryValuesRandomPostsDTO
  ) {
    const userData = request.user as UserData

    // Manually check because `JwtBooruAuthenticationGuard` is intentionally flawed
    if (!userData) {
      this.booruService.checkIfItsFromDefaultBooruList(queries.baseEndpoint)
    }

    const Api = this.booruService.buildApiClass(params, queries)

    const postQueryValues: IBooruQueryValues['randomPosts'] = {
      limit: queries.limit,
      pageID: queries.pageID,
      tags: queries.tags,
      rating: queries.rating,
      score: queries.score,
      order: queries.order
    }

    return Api.getRandomPosts(postQueryValues)
  }

  @Get(':booruType/single-post')
  @Header('Cache-Control', 'public, max-age=604800, immutable')
  @UseGuards(JwtBooruGuard)
  GetSinglePost(
    @Request()
    request,
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruQueryValuesSinglePostDTO
  ) {
    const userData = request.user as UserData

    // Manually check because `JwtBooruAuthenticationGuard` is intentionally flawed
    if (!userData) {
      this.booruService.checkIfItsFromDefaultBooruList(queries.baseEndpoint)
    }

    const Api = this.booruService.buildApiClass(params, queries)

    const postQueryValues: IBooruQueryValues['singlePost'] = {
      id: queries.ID
    }

    return Api.getSinglePost(postQueryValues)
  }

  @Get(':booruType/tags')
  @Header('Cache-Control', 'public, max-age=3600')
  @UseGuards(JwtBooruGuard)
  GetTags(
    @Request()
    request,
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruQueryValuesTagsDTO
  ) {
    const userData = request.user as UserData

    // Manually check because `JwtBooruAuthenticationGuard` is intentionally flawed
    if (!userData) {
      this.booruService.checkIfItsFromDefaultBooruList(queries.baseEndpoint)
    }

    const Api = this.booruService.buildApiClass(params, queries)

    const postQueryValues: IBooruQueryValues['tags'] = {
      tag: queries.tag,
      tagEnding: queries.tagEnding,
      limit: queries.limit,
      pageID: queries.pageID,
      order: queries.order
    }

    return Api.getTags(postQueryValues)
  }
}
