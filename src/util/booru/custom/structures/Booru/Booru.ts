// Types
import { PostResponse, ProcessedQueries } from '../types'

// Utilities
import httpFetch from '@/util/booru/httpFetch'
import customXMLToJson from '@/util/booru/custom/customXMLToJson'
import { ProcessPosts } from '../Post'

// Init
import Debug from 'debug'
const debug = Debug(`Server:util Booru`)

interface QueryIdentifier {
  limit: string
  pageID: string
  tags: string
  rating?: string
  score?: string
  order?: string
}

interface BooruEndpoints {
  base: string
  posts: string
  tags: string
  singlePost: string
  randomPost: string
}

export class Booru {
  public booruType = 'booru'

  public queryIdentifier: QueryIdentifier = {
    limit: undefined,
    pageID: undefined,
    tags: undefined,
    rating: undefined,
    score: undefined,
    order: undefined,
  }

  public endpoints: BooruEndpoints = {
    base: undefined,
    posts: undefined,
    tags: undefined,
    singlePost: undefined,
    randomPost: undefined,
  }

  constructor(endpoints: BooruEndpoints, queryStrings: QueryIdentifier) {
    this.endpoints = endpoints
    this.endpoints.base = `https://${this.endpoints.base}`

    this.queryIdentifier = queryStrings
  }

  public async getPosts(queryObj: ProcessedQueries): Promise<PostResponse[]> {
    // Declare base URL
    let URLToFetch = this.endpoints.base + this.endpoints.posts

    URLToFetch = this.addQueriesToURL(URLToFetch, 'posts', queryObj)

    let response = await httpFetch(URLToFetch)

    try {
      response = JSON.parse(response)
    } catch (error) {
      debug('Response was not JSON')
      response = await customXMLToJson(response)
      // debug(response)
    }

    return ProcessPosts(response)
  }

  private addQueriesToURL(
    URL: string,
    mode: string,
    queryObj: ProcessedQueries
  ): string {
    const { limit, pageID, tags, rating, score, order } = queryObj

    switch (mode) {
      case 'posts':
        // Add & if ? is present
        URL += URL.includes('?') ? '&' : '?'

        // Limit
        URL += this.queryIdentifier.limit + '=' + limit

        // Page ID
        if (pageID) {
          URL += '&' + this.queryIdentifier.pageID + '=' + pageID
        }

        // Tags
        URL += '&' + this.queryIdentifier.tags + '=' + tags

        // Rating
        if (rating) {
          let tmpRating: string
          let prefix: string

          switch (rating.charAt(0)) {
            case '-':
              // debug('Sign detected')
              prefix = '-'
              tmpRating = rating.substring(1)
              break

            // No '+' case because + gets encoded to space
            default:
              prefix = '+'
              tmpRating = rating
              break
          }

          URL += prefix + this.queryIdentifier.rating + ':' + tmpRating
        }

        // Score
        if (score) {
          URL += '+' + this.queryIdentifier.score + '=' + score
        }

        // Order
        if (order) {
          URL += '+' + this.queryIdentifier.order + ':' + order
        }

        break

      // case 'tags':
      //   break

      default:
        throw new Error('No mode specified')
    }

    return URL
  }
}
