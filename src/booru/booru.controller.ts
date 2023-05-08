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
import { ResponseDto } from '../lib/dto/response.dto'

@Controller('booru')
@UseInterceptors(BooruErrorsInterceptor)
export class BooruController {
  constructor(private readonly booruService: BooruService) {}

  @Get(':booruType/posts')
  @Header('Cache-Control', 'public, max-age=250')
  @UseGuards(JwtBooruGuard)
  async GetPosts(
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

    const posts = await Api.getPosts(postQueryValues)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    queries.pageID = queries.pageID ?? Api.booruType.initialPageID

    return ResponseDto.createFromController(request, queries, Api, posts)
  }

  @Get(':booruType/random-posts')
  @Header('Cache-Control', 'no-cache')
  @UseGuards(JwtBooruGuard)
  async GetRandomPosts(
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

    const posts = await Api.getRandomPosts(postQueryValues)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    queries.pageID = queries.pageID ?? Api.booruType.initialPageID

    return ResponseDto.createFromController(request, queries, Api, posts)
  }

  @Get(':booruType/single-post')
  @Header('Cache-Control', 'public, max-age=604800, immutable')
  @UseGuards(JwtBooruGuard)
  async GetSinglePost(
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

    const posts = await Api.getSinglePost(postQueryValues)

    return ResponseDto.createFromController(request, queries, Api, posts)
  }

  @Get(':booruType/tags')
  @Header('Cache-Control', 'public, max-age=3600')
  @UseGuards(JwtBooruGuard)
  async GetTags(
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

    const tags = await Api.getTags(postQueryValues)

    return ResponseDto.createFromController(request, queries, Api, tags)
  }
}
