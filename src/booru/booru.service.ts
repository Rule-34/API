import { Injectable } from '@nestjs/common'
import {
  BooruTypes,
  BooruTypesStringEnum,
  Danbooru,
  Danbooru2,
  E621Net,
  Gelbooru,
  GelbooruCom,
  IBooruEndpoints,
  IBooruOptions,
  IBooruQueryIdentifiers,
  Moebooru,
  RealBooruCom,
  Rule34PahealNet,
  Rule34Xxx
} from '@alejandroakbal/universal-booru-wrapper'
import { booruQueriesDTO } from './dto/booru-queries.dto'
import { BooruEndpointParamsDTO } from './dto/request-booru.dto'

@Injectable()
export class BooruService {
  public buildApiClass(params: BooruEndpointParamsDTO, queries: booruQueriesDTO): BooruTypes {
    const booruClass = this.getApiClassByType(params.booruType)

    const endpoints: IBooruEndpoints = {
      base: queries.baseEndpoint,
      posts: queries.postsEndpoint,
      randomPosts: queries.randomPostsEndpoint,
      singlePost: queries.singlePostEndpoint,
      tags: queries.tagsEndpoint
    }

    const defaultQueryIdentifiers: IBooruQueryIdentifiers = {
      posts: {
        limit: queries.defaultQueryIdentifiersPostsLimit,
        pageID: queries.defaultQueryIdentifiersPostsPageID,
        tags: queries.defaultQueryIdentifiersPostsTags,
        rating: queries.defaultQueryIdentifiersPostsRating,
        score: queries.defaultQueryIdentifiersPostsScore,
        order: queries.defaultQueryIdentifiersPostsOrder
      },

      randomPosts: {
        limit: queries.defaultQueryIdentifiersRandomPostsLimit,
        pageID: queries.defaultQueryIdentifiersRandomPostsPageID,
        tags: queries.defaultQueryIdentifiersRandomPostsTags,
        rating: queries.defaultQueryIdentifiersRandomPostsRating,
        score: queries.defaultQueryIdentifiersRandomPostsScore,
        order: queries.defaultQueryIdentifiersRandomPostsOrder
      },

      singlePost: {
        id: queries.defaultQueryIdentifiersSinglePostID
      },

      tags: {
        tag: queries.defaultQueryIdentifiersTagsTag,
        tagEnding: queries.defaultQueryIdentifiersTagsTagEnding,
        limit: queries.defaultQueryIdentifiersTagsLimit,
        pageID: queries.defaultQueryIdentifiersTagsPageID,
        order: queries.defaultQueryIdentifiersTagsOrder
      }
    }

    // No default QueryValues are needed

    const options: IBooruOptions = { HTTPScheme: queries.httpScheme }

    const Api = new booruClass(endpoints, defaultQueryIdentifiers, undefined, options)

    return Api
  }

  private getApiClassByType(booruType: BooruTypesStringEnum) {
    switch (booruType) {
      case BooruTypesStringEnum.DANBOORU:
        return Danbooru

      case BooruTypesStringEnum.DANBOORU2:
        return Danbooru2

      case BooruTypesStringEnum.MOEBOORU:
        return Moebooru

      case BooruTypesStringEnum.GELBOORU:
        return Gelbooru

      case BooruTypesStringEnum.RULE_34_XXX:
        return Rule34Xxx

      case BooruTypesStringEnum.RULE34_PAHEAL_NET:
        return Rule34PahealNet

      case BooruTypesStringEnum.GELBOORU_COM:
        return GelbooruCom

      case BooruTypesStringEnum.E621_NET:
        return E621Net

      case BooruTypesStringEnum.REALBOORU_COM:
        return RealBooruCom
    }
  }
}
