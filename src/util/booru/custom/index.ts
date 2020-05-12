// Classes
import {
  Danbooru2,
  Danbooru,
  Gelbooru,
  Shimmie2,
  Moebooru,
} from './structures/booru'
import { CustomError } from '@/util/classes'

// Types
import { Request } from 'express'
import { BooruResponses } from './structures/types'

export async function BooruHandler(
  endpoint: string,
  queryObj: Request['query']
): Promise<PostResponse[]> {
  // General
  const { domain, booruType } = queryObj

  // BOORU
  let API
  switch (booruType) {
    case 'danbooru':
      API = new Danbooru(domain as string)
      break

    case 'danbooru2':
      API = new Danbooru2(domain as string)
      break

    // MyImouto is quite similar
    // Danbooru is quite similar
    case 'moebooru':
      API = new Moebooru(domain as string)
      break

    case 'shimmie2':
      API = new Shimmie2(domain as string)
      break

    case 'gelbooru':
      API = new Gelbooru(domain as string)
      break

    default:
      throw new CustomError('No known booru type', 400)
  }

  // ENDPOINT
  switch (endpoint) {
    case 'posts':
      // POSTS
      const processedPostQueries = {
        limit: Number(queryObj.limit ?? 20),
        pageID: Number(queryObj.pid),
        tags: (queryObj.tags as string) ?? '',
        rating: queryObj.rating as string,
        score: Number(queryObj.score),
        order: queryObj.order as string,
      }

      return await API.getPosts(processedPostQueries)


    // case 'single-post':
    // const processedSinglePostQueries = {
    //   postID: Number(queryObj.postID),
    // }

    // return await API.getTags(processedTagQueries)

    default:
      throw new CustomError('No endpoint specified', 400)
  }
}
