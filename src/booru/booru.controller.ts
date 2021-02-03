import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { IBooruQueryValues } from '@alejandroakbal/universal-booru-wrapper'
import { BooruEndpointParamsDTO } from './dto/request-booru.dto'
import {
  booruPostsQueriesDTO,
  booruRandomPostsQueriesDTO,
  booruSinglePostQueriesDTO,
  booruTagsQueriesDTO,
} from './dto/booru-queries.dto'
import { BooruService } from './booru.service'
import { BooruErrorsInterceptor } from './interceptors/booru-exception.interceptor'
import { UserData } from '../users/interfaces/users.interface'
import { JwtBooruAuthenticationGuard } from '../auth/guards/jwt-authentication.guard'

@Controller('booru')
@UseInterceptors(BooruErrorsInterceptor)
export class BooruController {
  constructor(private readonly booruService: BooruService) {}

  @Get(':booruType/posts')
  @Header('Cache-Control', 'public, max-age=250')
  @UseGuards(JwtBooruAuthenticationGuard)
  GetPosts(
    @Request()
    request,
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruPostsQueriesDTO
  ) {
    const userData = request.user as UserData

    if (!userData) {
      this.booruService.checkIfItsFromDefaultBooruList(queries)
    }

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
  @UseGuards(JwtBooruAuthenticationGuard)
  GetRandomPosts(
    @Request()
    request,
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruRandomPostsQueriesDTO
  ) {
    const userData = request.user as UserData

    if (!userData) {
      this.booruService.checkIfItsFromDefaultBooruList(queries)
    }

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
  @UseGuards(JwtBooruAuthenticationGuard)
  GetSinglePost(
    @Request()
    request,
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruSinglePostQueriesDTO
  ) {
    const userData = request.user as UserData

    if (!userData) {
      this.booruService.checkIfItsFromDefaultBooruList(queries)
    }

    const Api = this.booruService.buildApiClass(params, queries)

    const postQueryValues: IBooruQueryValues['singlePost'] = {
      id: queries.id,
    }

    return Api.getSinglePost(postQueryValues)
  }

  @Get(':booruType/tags')
  @Header('Cache-Control', 'public, max-age=3600')
  @UseGuards(JwtBooruAuthenticationGuard)
  GetTags(
    @Request()
    request,
    @Param()
    params: BooruEndpointParamsDTO,
    @Query()
    queries: booruTagsQueriesDTO
  ) {
    const userData = request.user as UserData

    if (!userData) {
      this.booruService.checkIfItsFromDefaultBooruList(queries)
    }

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
