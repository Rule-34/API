// Types
import { Request } from 'express'
import { BooruResponses, BooruData } from '@/types/types'

// Classes
import { Danbooru2, Danbooru, Gelbooru, Shimmie2 } from './structures'
import { CustomError } from '@/util/classes'

export async function BooruHandler(
  { booruType, endpoint }: BooruData.DataBetweenFunctions,
  queryObj: Request['query']
): Promise<BooruResponses.Response[]> {
  // General
  const { domain, json } = queryObj

  // Extract values from JSON
  let tmpJSON
  let requestedEndpoints
  let requestedQueryIdentifiers

  if (json) {
    tmpJSON = JSON.parse(json as string)
    requestedEndpoints = tmpJSON.endpoints
    requestedQueryIdentifiers = tmpJSON.queryIdentifiers

    // console.log({ requestedEndpoints, requestedQueryIdentifiers })
  }

  // BOORU
  let API
  switch (booruType) {
    // Moebooru and MyImouto are danbooru
    case 'danbooru':
      API = new Danbooru(
        booruType,
        domain as string,
        requestedEndpoints,
        requestedQueryIdentifiers
      )
      break

    case 'danbooru2':
      API = new Danbooru2(
        booruType,
        domain as string,
        requestedEndpoints,
        requestedQueryIdentifiers
      )
      break

    case 'shimmie2':
      API = new Shimmie2(
        booruType,
        domain as string,
        requestedEndpoints,
        requestedQueryIdentifiers
      )
      break

    case 'gelbooru':
      API = new Gelbooru(
        booruType,
        domain as string,
        requestedEndpoints,
        requestedQueryIdentifiers
      )
      break

    default:
      throw new CustomError('No known booru type', 422)
  }

  // ENDPOINT
  switch (endpoint) {
    case 'posts':
      // Default values if not set
      const inputPostQueries = {
        limit: Number(queryObj.limit ?? 20),
        pageID: Number(queryObj.pid),
        tags: (queryObj.tags as string) ?? '',
        rating: queryObj.rating as string,
        score: queryObj.score as string,
        order: queryObj.order as string,
      }

      return await API.getPosts(inputPostQueries)

    case 'tags':
      // Default values if not set
      const inputTagQueries = {
        tag: queryObj.tag as string,
        limit: Number(queryObj.limit ?? 20),
        pageID: Number(queryObj.pid),
        order: (queryObj.order as string) ?? 'count',
      }

      return await API.getTags(inputTagQueries)

    case 'single-post':
      const processedSinglePostQueries = {
        id: Number(queryObj.id),
      }

      return await API.getSinglePost(processedSinglePostQueries)

    case 'random-post':
      const processedRandomPostQueries = {
        limit: Number(queryObj.limit ?? 1),
        tags: (queryObj.tags as string) ?? '',
        rating: queryObj.rating as string,
        score: queryObj.score as string,
      }

      return await API.getRandomPost(processedRandomPostQueries)

    default:
      throw new CustomError('No endpoint specified', 422)
  }
}
