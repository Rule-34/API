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

  public queryIdentifiers: BooruClass.QueryIdentifiers = {
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
      tagEnding: undefined,
      limit: undefined,
      pageID: undefined,
      order: undefined,
      raw: undefined,
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
    queryIdentifiers: BooruClass.QueryIdentifiers
  ) {
    this.endpoints = endpoints
    this.endpoints.base = `https://${this.endpoints.base}`

    this.queryIdentifiers = queryIdentifiers
  }

  public async getPosts(
    queryObj: BooruData.InputPostQueries
  ): Promise<BooruResponses.PostResponse[]> {
    // Declare base URL
    let URLToFetch = this.endpoints.base + this.endpoints.posts

    URLToFetch = this.addQueriesToURL(URLToFetch, 'posts', queryObj)

    let response = await httpFetch(URLToFetch)

    try {
      response = JSON.parse(response)
    } catch (error) {
      debug('Response was not JSON')
      response = await customXMLToJson(response, 'posts')
      // debug(response)
    }

    return ProcessPosts(response)
  }

  public async getTags(
    queryObj: BooruData.InputTagQueries
  ): Promise<BooruResponses.TagResponse[]> {
    // Declare base URL
    let URLToFetch = this.endpoints.base + this.endpoints.tags

    URLToFetch = this.addQueriesToURL(URLToFetch, 'tags', queryObj)

    let response = await httpFetch(URLToFetch)

    try {
      response = JSON.parse(response)
    } catch (error) {
      debug('Response was not JSON')
      response = await customXMLToJson(response, 'tags')
      // debug(response)
    }

    return ProcessTags(response)
  }

  private addQueriesToURL(
    URL: string,
    mode: string,
    queryObj: BooruData.InputPostQueries | BooruData.InputTagQueries
  ): string {
    const {
      limit,
      pageID,
      tags,
      rating,
      score,
      order,
    } = queryObj as BooruData.InputPostQueries

    const { tag } = queryObj as BooruData.InputTagQueries

    // Add & if ? is present
    URL += URL.includes('?') ? '&' : '?'

    switch (mode) {
      case 'posts':
        // Limit
        if (limit && this.queryIdentifiers.posts.limit)
          URL += this.queryIdentifiers.posts.limit + '=' + limit

        // Page ID
        if (pageID && this.queryIdentifiers.posts.pageID) {
          URL += '&' + this.queryIdentifiers.posts.pageID + '=' + pageID
        }

        // Tags
        URL += '&' + this.queryIdentifiers.posts.tags + '=' + tags

        // Rating
        if (rating && this.queryIdentifiers.posts.rating) {
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

          URL += prefix + this.queryIdentifiers.posts.rating + ':' + tmpRating
        }

        // Score
        if (score && this.queryIdentifiers.posts.score) {
          URL += '+' + this.queryIdentifiers.posts.score + '=' + score
        }

        // Order
        if (order && this.queryIdentifiers.posts.order) {
          URL += '+' + this.queryIdentifiers.posts.order + ':' + order
        }

        break

      case 'tags':
        // Tag
        URL += this.queryIdentifiers.tags.tag + '=' + tag

        // Tag Ending
        if (this.queryIdentifiers.tags.tagEnding) {
          URL += this.queryIdentifiers.tags.tagEnding
        }

        // Limit
        if (limit && this.queryIdentifiers.tags.limit) {
          URL += '&' + this.queryIdentifiers.tags.limit + '=' + limit
        }

        // Page ID
        if (pageID && this.queryIdentifiers.tags.pageID) {
          URL += '&' + this.queryIdentifiers.tags.pageID + '=' + pageID
        }

        // Order
        if (order && this.queryIdentifiers.tags.order) {
          console.log(order)

          URL += '&' + this.queryIdentifiers.tags.order + '=' + order
        }

        // Raw methods to add
        if (this.queryIdentifiers.tags.raw) {
          URL += '&' + this.queryIdentifiers.tags.raw
        }
        break

      default:
        throw new Error('No mode specified')
    }

    return URL
  }
}
