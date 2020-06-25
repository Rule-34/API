// Types
import { Request } from 'express'
import { Booru, Miscellaneous } from '../../types/types'
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

import { GenericAPIError } from '../../util/error'

export async function BooruHandler(
  { booruType, endpoint }: Miscellaneous.DataBetweenFunctions,
  queryObj: Request['query']
): Promise<Booru.Structures.Data.Processed.Response[]> {
  const { domain, config } = queryObj

  // Extract values from JSON
  let endpoints = { base: domain as string }
  let queryIdentifiers: IBooruQueryIdentifiers | undefined
  let options: IBooruOptions | undefined

  if (config) {
    const parsedConfig = JSON.parse(config as string)

    endpoints = { ...parsedConfig.endpoints, ...endpoints }
    queryIdentifiers = parsedConfig.queryIdentifiers
    options = parsedConfig.options
  }

  /*
   *  BOORU
   */
  let API
  switch (booruType) {
    case 'gelbooru':
      API = new Gelbooru(endpoints, queryIdentifiers, undefined, options)
      break

    case 'shimmie2':
      API = new Shimmie2(endpoints, queryIdentifiers, undefined, options)
      break

    // Moebooru and MyImouto are danbooru
    case 'danbooru':
      API = new Danbooru(endpoints, queryIdentifiers, undefined, options)
      break

    case 'danbooru2':
      API = new Danbooru2(endpoints, queryIdentifiers, undefined, options)
      break

    case 'e621':
      API = new E621(endpoints, queryIdentifiers, undefined, options)
      break

    default:
      throw new GenericAPIError('No known booru type', undefined, 422)
  }

  /*
   *  ENDPOINT
   */

  const parsedPostQueries: IBooruQueryValues['posts'] = {
    limit: Number(queryObj.limit) || 20,
    pageID: Number(queryObj.pid) || undefined,
    tags: queryObj.tags as string,
    rating: queryObj.rating as 'safe' | 'questionable' | 'explicit',
    score: queryObj.score as string,
    order: queryObj.order as string,
  }

  const parsedTagQueries: IBooruQueryValues['tags'] = {
    tag: queryObj.tag as string,
    limit: Number(queryObj.limit) || 20,
    pageID: Number(queryObj.pid) || undefined,
    order: (queryObj.order as string) ?? 'count',
  }

  const parsedSinglePostQueries: IBooruQueryValues['singlePost'] = {
    id: Number(queryObj.id),
  }

  const parsedRandomPostsQueries: IBooruQueryValues['randomPosts'] = {
    limit: Number(queryObj.limit) || 1,
    pageID: Number(queryObj.pid) || undefined,
    tags: queryObj.tags as string,
    rating: queryObj.rating as IBooruQueryValues['randomPosts']['rating'],
    order: queryObj.order as string,
    score: queryObj.score as string,
  }

  switch (endpoint) {
    case 'posts':
      return await API.getPosts(parsedPostQueries)

    case 'tags':
      return await API.getTags(parsedTagQueries)

    case 'single-post':
      return await API.getSinglePost(parsedSinglePostQueries)

    case 'random-post':
      return await API.getRandomPosts(parsedRandomPostsQueries)

    default:
      throw new GenericAPIError('No endpoint specified', undefined, 422)
  }
}
