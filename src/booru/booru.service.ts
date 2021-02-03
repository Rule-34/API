import { Injectable, UnauthorizedException } from '@nestjs/common'
import {
  BooruTypesStringEnum,
  Gelbooru,
  Paheal,
  Danbooru,
  Danbooru2,
  E621,
  IBooruEndpoints,
  IBooruOptions,
  BooruTypes,
  IBooruQueryIdentifiers,
} from '@alejandroakbal/universal-booru-wrapper'
import { booruQueriesDTO } from './dto/booru-queries.dto'
import { BooruEndpointParamsDTO } from './dto/request-booru.dto'
import {
  defaultBooruList,
  findBoorusWithValueByKey,
} from '../external/r34_shared/src/util/BooruUtils'

@Injectable()
export class BooruService {
  private getApiClassByType(booruType: BooruTypesStringEnum) {
    switch (booruType) {
      case BooruTypesStringEnum.GELBOORU:
        return Gelbooru

      case BooruTypesStringEnum.PAHEAL:
        return Paheal

      // Moebooru and MyImouto are danbooru
      case BooruTypesStringEnum.DANBOORU:
        return Danbooru

      case BooruTypesStringEnum.DANBOORU2:
        return Danbooru2

      case BooruTypesStringEnum.E621:
        return E621
    }
  }

  public buildApiClass(
    params: BooruEndpointParamsDTO,
    queries: booruQueriesDTO
  ): BooruTypes {
    const booruClass = this.getApiClassByType(params.booruType)

    const endpoints: IBooruEndpoints = {
      base: queries.baseEndpoint,
      posts: queries.postsEndpoint,
      randomPosts: queries.randomPostsEndpoint,
      singlePost: queries.singlePostEndpoint,
      tags: queries.tagsEndpoint,
    }

    const defaultQueryIdentifiers: IBooruQueryIdentifiers = {
      tags: {
        tag: queries.defaultQueryIdentifiersTagsTag,
        tagEnding: queries.defaultQueryIdentifiersTagsTagEnding,
      },
    }

    // No default QueryValues are needed

    const options: IBooruOptions = { HTTPScheme: queries.httpScheme }

    const Api = new booruClass(
      endpoints,
      defaultQueryIdentifiers,
      undefined,
      options
    )

    return Api
  }

  public checkIfItsFromDefaultBooruList(queries: booruQueriesDTO) {
    const booru = findBoorusWithValueByKey(
      queries.baseEndpoint,
      'domain',
      defaultBooruList
    )

    if (!booru || !booru.length) {
      throw new UnauthorizedException()
    }
  }
}
