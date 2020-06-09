// Types
import { Request } from 'express'
import { Booru, Miscellaneous } from '@src/types/types'

import { Gelbooru } from './structures/Gelbooru'
import { Shimmie2 } from './structures/Shimmie2'
import { Danbooru } from './structures/Danbooru'
import { Danbooru2 } from './structures/Danbooru2'
import { E621 } from './structures/E621'

import { GenericAPIError } from '@src/util/classes'

export async function BooruHandler(
  { booruType, endpoint }: Miscellaneous.DataBetweenFunctions,
  queryObj: Request['query']
): Promise<Booru.Structures.Data.Processed.Response[]> {
  // General
  const { domain, config } = queryObj

  // Extract values from JSON
  let requestedEndpoints
  let requestedQueryIdentifiers

  if (config) {
    const tmpJSON = JSON.parse(config as string)
    requestedEndpoints = tmpJSON.endpoints
    requestedQueryIdentifiers = tmpJSON.queryIdentifiers
  }

  /*
   *  BOORU
   */
  let API
  switch (booruType) {
    case 'gelbooru':
      API = new Gelbooru(domain as string, booruType, {
        requestedEndpoints,
        requestedQueryIdentifiers,
      })
      break

    case 'shimmie2':
      API = new Shimmie2(domain as string, booruType, {
        requestedEndpoints,
        requestedQueryIdentifiers,
      })
      break

    // Moebooru and MyImouto are danbooru
    case 'danbooru':
      API = new Danbooru(domain as string, booruType, {
        requestedEndpoints,
        requestedQueryIdentifiers,
      })
      break

    case 'danbooru2':
      API = new Danbooru2(domain as string, booruType, {
        requestedEndpoints,
        requestedQueryIdentifiers,
      })
      break

    case 'e621':
      API = new E621(domain as string, booruType, {
        requestedEndpoints,
        requestedQueryIdentifiers,
      })
      break

    default:
      throw new GenericAPIError('No known booru type', undefined, 422)
  }

  /*
   *  ENDPOINT
   */

  // Default values
  const requestedPostQueries = {
    limit: Number(queryObj.limit ?? 20),
    pageID: Number(queryObj.pid),
    tags: (queryObj.tags as string) ?? '',
    rating: queryObj.rating as string,
    score: queryObj.score as string,
    order: queryObj.order as string,
  }

  const requestedTagQueries = {
    tag: queryObj.tag as string,
    limit: Number(queryObj.limit ?? 20),
    pageID: Number(queryObj.pid),
    order: (queryObj.order as string) ?? 'count',
  }

  const requestedSinglePostQueries = {
    id: Number(queryObj.id),
  }

  const requestedRandomPostQueries = {
    limit: Number(queryObj.limit ?? 1),
    tags: (queryObj.tags as string) ?? '',
    rating: queryObj.rating as string,
    score: queryObj.score as string,
  }

  switch (endpoint) {
    case 'posts':
      return await API.getPosts(requestedPostQueries)

    case 'tags':
      return await API.getTags(requestedTagQueries)

    case 'single-post':
      return await API.getSinglePost(requestedSinglePostQueries)

    case 'random-post':
      return await API.getRandomPost(requestedRandomPostQueries)

    default:
      throw new GenericAPIError('No endpoint specified', undefined, 422)
  }
}
