// Types
import { Request } from 'express'
import { BooruResponses, BooruData } from '@/types/types'

// Classes
import { Danbooru2, Danbooru, Gelbooru, Shimmie2 } from './structures/booru'
import { CustomError } from '@/util/classes'

export async function BooruHandler(
  { booruType, endpoint }: BooruData.DataBetweenFunctions,
  queryObj: Request['query']
): Promise<BooruResponses.PostResponse[] | BooruResponses.TagResponse[]> {
  // General
  const { domain } = queryObj

  // BOORU
  let API
  switch (booruType) {
    // Moebooru and MyImouto are danbooru
    case 'danbooru':
      API = new Danbooru(booruType, domain as string)
      break

    case 'danbooru2':
      API = new Danbooru2(booruType, domain as string)
      break

    case 'shimmie2':
      API = new Shimmie2(booruType, domain as string)
      break

    case 'gelbooru':
      API = new Gelbooru(booruType, domain as string)
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
        score: Number(queryObj.score),
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

    // return await API.getTags(processedTagQueries)

    default:
      throw new CustomError('No endpoint specified', 422)
  }
}
