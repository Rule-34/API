import { PostResponse, ProcessedQueries } from '../types'

import httpFetch from '@/util/booru/httpFetch'
import { ProcessPosts } from '../Post'

interface QueryIdentifier {
  limit: string
  pageID: string
  tags: string
  rating: string
  score: string
  order: string
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

  public async getPosts(queries: ProcessedQueries): Promise<PostResponse[]> {
    const { limit, pageID, tags, rating, score, order } = queries

    // Declare base URL
    let URLToFetch = this.endpoints.base + this.endpoints.posts

    // Add & if ? is present
    URLToFetch += URLToFetch.includes('?') ? '&' : '?'

    URLToFetch += this.queryIdentifier.limit + '=' + limit

    if (pageID) {
      URLToFetch += '&' + this.queryIdentifier.pageID + '=' + pageID
    }

    URLToFetch += '&' + this.queryIdentifier.tags + '=' + tags

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

      URLToFetch += prefix + this.queryIdentifier.rating + ':' + tmpRating
    }

    if (score) {
      URLToFetch += '+' + this.queryIdentifier.score + '=' + score
    }

    if (order) {
      URLToFetch += '+' + this.queryIdentifier.order + ':' + order
    }

    // TODO: Test if response is XML and process it
    const response = JSON.parse(await httpFetch(URLToFetch))

    return ProcessPosts(response)
  }
}

export class Danbooru extends Booru {
  constructor(base: string) {
    super(
      {
        base: base,
        posts: '/posts.json',
        tags: '/tags.json',
        singlePost: '/posts/',
        randomPost: '/posts.json',
      },
      {
        limit: 'limit',
        pageID: 'page',
        tags: 'tags',
        rating: 'rating',
        score: 'score',
        order: 'order',
      }
    )
  }
}
