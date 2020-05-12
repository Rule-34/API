// Types
import { BooruClass, BooruResponses, BooruData } from '../types'

// Utilities
import httpFetch from '@/util/booru/httpFetch'
import customXMLToJson from '@/util/booru/custom/customXMLToJson'
import { ProcessPosts } from '../Post'

// Init
import Debug from 'debug'
import { ProcessTags } from '../Tags'
const debug = Debug(`Server:util Booru`)

export class Booru {
  public booruType = 'booru'

  public queryIdentifier: BooruClass.QueryIdentifier = {
    posts: {
      limit: undefined,
      pageID: undefined,
      tags: undefined,
      rating: undefined,
      score: undefined,
      order: undefined,
    },

    tags: {
      tag: undefined,
      limit: undefined,
      pageID: undefined,
      order: undefined,
    },
  }

  public endpoints: BooruClass.BooruEndpoints = {
    base: undefined,
    posts: undefined,
    tags: undefined,
    singlePost: undefined,
    randomPost: undefined,
  }

  constructor(
    endpoints: BooruClass.BooruEndpoints,
    queryStrings: BooruClass.QueryIdentifier
  ) {
    this.endpoints = endpoints
    this.endpoints.base = `https://${this.endpoints.base}`

    this.queryIdentifier = queryStrings
  }

  public async getPosts(
    queryObj: BooruData.ProcessedPostQueries
  ): Promise<BooruResponses.PostResponse[]> {
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

  public async getTags(
    queryObj: BooruData.ProcessedTagQueries
  ): Promise<BooruResponses.TagResponse[]> {
    // Declare base URL
    let URLToFetch = this.endpoints.base + this.endpoints.tags

    URLToFetch = this.addQueriesToURL(URLToFetch, 'tags', queryObj)

    let response = await httpFetch(URLToFetch)

    response = JSON.parse(response)

    return ProcessTags(response)
  }

  private addQueriesToURL(
    URL: string,
    mode: string,
    queryObj: BooruData.ProcessedPostQueries | BooruData.ProcessedTagQueries
  ): string {
    const {
      limit,
      pageID,
      tags,
      rating,
      score,
      order,
    } = queryObj as BooruData.ProcessedPostQueries

    const { tag } = queryObj as BooruData.ProcessedTagQueries

    // Add & if ? is present
    URL += URL.includes('?') ? '&' : '?'

    switch (mode) {
      case 'posts':
        // Limit
        URL += this.queryIdentifier.posts.limit + '=' + limit

        // Page ID
        if (pageID) {
          URL += '&' + this.queryIdentifier.posts.pageID + '=' + pageID
        }

        // Tags
        URL += '&' + this.queryIdentifier.posts.tags + '=' + tags

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

          URL += prefix + this.queryIdentifier.posts.rating + ':' + tmpRating
        }

        // Score
        if (score) {
          URL += '+' + this.queryIdentifier.posts.score + '=' + score
        }

        // Order
        if (order) {
          URL += '+' + this.queryIdentifier.posts.order + ':' + order
        }

        break

      case 'tags':
        // Tag
        URL += this.queryIdentifier.tags.tag + '=' + tag + '*' // This shouldnt be necessary

        // Limit
        URL += '&' + this.queryIdentifier.tags.limit + '=' + limit

        // Page ID
        if (pageID) {
          URL += '&' + this.queryIdentifier.tags.pageID + '=' + pageID
        }

        // Order
        if (order) {
          URL += '&' + this.queryIdentifier.tags.order + '=' + order
        }
        break

      default:
        throw new Error('No mode specified')
    }

    return URL
  }
}
