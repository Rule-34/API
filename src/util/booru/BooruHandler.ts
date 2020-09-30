import { Request } from 'express'
import {
  IBooruQueryIdentifiers,
  IBooruQueryValues,
  IBooruOptions,
} from '@alejandroakbal/universal-booru-wrapper/dist/structures/GenericBooru'
import {
  Gelbooru,
  Shimmie2,
  Danbooru,
  Danbooru2,
  E621,
} from '@alejandroakbal/universal-booru-wrapper'

import { Booru, Miscellaneous } from '../../types/types'
import { GenericAPIError } from '../../util/error'
import BooruType from './BooruType'
import Endpoint from './Endpoint'

//#region Helper Functions

function getApiConstructorByType(booruType: BooruType) {
  switch (booruType) {
    case BooruType.GELBOORU:
      return Gelbooru

    case BooruType.SHIMMIE2:
      return Shimmie2

    // Moebooru and MyImouto are danbooru
    case BooruType.DANBOORU:
      return Danbooru

    case BooruType.DANBOORU2:
      return Danbooru2

    case BooruType.E621:
      return E621

    default:
      throw new GenericAPIError('No known booru type', undefined, 422)
  }
}

//#endregion

export async function BooruHandler(
  { booruType, endpoint }: Miscellaneous.DataBetweenFunctions,
  queryObj: Request['query']
): Promise<Booru.Structures.Data.Processed.Response[]> {
  const { domain, config } = queryObj

  // Extract values from JSON if possible
  let endpoints = { base: domain as string }
  let queryIdentifiers: IBooruQueryIdentifiers | undefined
  let options: IBooruOptions | undefined

  if (config) {
    const parsedConfig = JSON.parse(config as string)

    endpoints = { ...parsedConfig.endpoints, ...endpoints }
    queryIdentifiers = parsedConfig.queryIdentifiers
    options = parsedConfig.options
  }

  // Select api depending on Booru type
  const Api = getApiConstructorByType(booruType as BooruType)
  const api = new Api(endpoints, queryIdentifiers, undefined, options)

  // Call api method based on endpoint
  switch (endpoint) {
    case Endpoint.POSTS:
      const parsedPostQueries: IBooruQueryValues['posts'] = {
        limit: Number(queryObj.limit) || 20,
        pageID: Number(queryObj.pid) || undefined,
        tags: queryObj.tags as string,
        rating: queryObj.rating as 'safe' | 'questionable' | 'explicit',
        score: queryObj.score as string,
        order: queryObj.order as string,
      }

      return await api.getPosts(parsedPostQueries)

    case Endpoint.TAGS:
      const parsedTagQueries: IBooruQueryValues['tags'] = {
        tag: queryObj.tag as string,
        limit: Number(queryObj.limit) || 20,
        pageID: Number(queryObj.pid) || undefined,
        order: (queryObj.order as string) ?? 'count',
      }

      return await api.getTags(parsedTagQueries)

    case Endpoint.SINGLE_POST:
      const parsedSinglePostQueries: IBooruQueryValues['singlePost'] = {
        id: Number(queryObj.id),
      }

      return await api.getSinglePost(parsedSinglePostQueries)

    case Endpoint.RANDOM_POST:
      const parsedRandomPostsQueries: IBooruQueryValues['randomPosts'] = {
        limit: Number(queryObj.limit) || 1,
        pageID: Number(queryObj.pid) || undefined,
        tags: queryObj.tags as string,
        rating: queryObj.rating as IBooruQueryValues['randomPosts']['rating'],
        order: queryObj.order as string,
        score: queryObj.score as string,
      }

      return await api.getRandomPosts(parsedRandomPostsQueries)

    default:
      throw new GenericAPIError('No endpoint specified', undefined, 422)
  }
}
