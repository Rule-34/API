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
  BooruObj,
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
      posts: {
        limit: queries.defaultQueryIdentifiersPostsLimit,
        pageID: queries.defaultQueryIdentifiersPostsPageID,
        tags: queries.defaultQueryIdentifiersPostsTags,
        rating: queries.defaultQueryIdentifiersPostsRating,
        score: queries.defaultQueryIdentifiersPostsScore,
        order: queries.defaultQueryIdentifiersPostsOrder,
      },

      randomPosts: {
        limit: queries.defaultQueryIdentifiersRandomPostsLimit,
        pageID: queries.defaultQueryIdentifiersRandomPostsPageID,
        tags: queries.defaultQueryIdentifiersRandomPostsTags,
        rating: queries.defaultQueryIdentifiersRandomPostsRating,
        score: queries.defaultQueryIdentifiersRandomPostsScore,
        order: queries.defaultQueryIdentifiersRandomPostsOrder,
      },

      singlePost: {
        id: queries.defaultQueryIdentifiersSinglePostID,
      },

      tags: {
        tag: queries.defaultQueryIdentifiersTagsTag,
        tagEnding: queries.defaultQueryIdentifiersTagsTagEnding,
        limit: queries.defaultQueryIdentifiersTagsLimit,
        pageID: queries.defaultQueryIdentifiersTagsPageID,
        order: queries.defaultQueryIdentifiersTagsOrder,
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

  public checkIfItsFromDefaultBooruList(domain: BooruObj['domain']) {
    const booru = findBoorusWithValueByKey(domain, 'domain', defaultBooruList)

    if (!booru || !booru.length) {
      throw new UnauthorizedException()
    }
  }
}
