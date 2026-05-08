import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
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
import { BooruAuthManagerService } from './services/booru-auth-manager.service'

export interface ResolvedAuthCredentials {
  auth?: { username: string; apiKey: string }
  source: 'query' | 'env' | 'none'
  selectedCredential?: { user: string; password: string }
}

export interface BuiltBooruApi {
  api: BooruTypes
  authResolution: ResolvedAuthCredentials
}

@Injectable()
export class BooruService {
  constructor(
    private readonly configService: ConfigService,
    private readonly authManager: BooruAuthManagerService
  ) {}

  public buildApiClass(params: BooruEndpointParamsDTO, queries: booruQueriesDTO): BooruTypes {
    return this.buildApiWithContext(params, queries).api
  }

  public buildApiWithContext(params: BooruEndpointParamsDTO, queries: booruQueriesDTO): BuiltBooruApi {
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

    // Resolve authentication credentials
    const authResolution = this.resolveAuthCredentials(queries)

    const options: IBooruOptions = {
      HTTPScheme: queries.httpScheme,
      auth: authResolution.auth
    }

    const Api = new booruClass(endpoints, defaultQueryIdentifiers, undefined, options)

    return {
      api: Api,
      authResolution
    }
  }

  private resolveAuthCredentials(queries: booruQueriesDTO): ResolvedAuthCredentials {
    // Priority 1: Query parameters
    if (queries.auth_user && queries.auth_pass) {
      return {
        auth: {
          username: queries.auth_user,
          apiKey: queries.auth_pass
        },
        source: 'query',
        selectedCredential: {
          user: queries.auth_user,
          password: queries.auth_pass
        }
      }
    }

    // Priority 2: Environment variables through auth manager
    const envCredentials = this.authManager.getAvailableCredential(queries.baseEndpoint)

    if (envCredentials) {
      return {
        auth: {
          username: envCredentials.user,
          apiKey: envCredentials.password
        },
        source: 'env',
        selectedCredential: envCredentials
      }
    }

    // Priority 3: No authentication
    return {
      source: 'none'
    }
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
