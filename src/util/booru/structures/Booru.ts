// Types
import { Booru } from '@/types/types'

// Utilities
import FetchUtil from '@/util/FetchUtil'
import XMLToJson from '@/util/XMLToJson'

// Classes
import { EmptyDataError, GenericAPIError } from '@/util/classes'

// Init
import Debug from 'debug'
const debug = Debug(`Server:util Booru Class`)

export abstract class GenericBooru {
  booruType: string

  queryIdentifiers: {
    posts: {
      limit: string
      pageID: string
      tags: string
      rating?: string
      score?: string
      order?: string
    }

    singlePost: {
      id?: string
    }

    tags: {
      tag: string
      tagEnding?: string
      limit?: string
      pageID?: string
      order?: string
      raw?: string
    }
  }

  endpoints: {
    base: string
    posts: string
    tags: string
    singlePost?: string
    randomPost?: string
  }

  constructor(
    booruType: GenericBooru['booruType'],
    endpoints: GenericBooru['endpoints'],
    queryIdentifiers: GenericBooru['queryIdentifiers']
  ) {
    this.booruType = booruType

    this.endpoints = endpoints
    this.endpoints.base = `https://${this.endpoints.base}`

    this.queryIdentifiers = queryIdentifiers
  }

  public async getPosts(
    queries: Booru.Structures.Requests.Queries.Posts
  ): Promise<Booru.Structures.Data.Processed.Response[]> {
    const Posts: Booru.Structures.Data.Processed.Post[] = []

    this.checkEndpointIsSupported(this.endpoints.posts)

    const URLToFetch = this.addQueriesToURL(
      this.endpoints.base + this.endpoints.posts,
      'posts',
      queries
    )

    const data = await this.fetchAndParseData(URLToFetch, 'posts')

    this.checkForEmptyPostsData(data)

    data.forEach((data: Booru.Structures.Data.Raw.Post) => {
      Posts.push(this.createPost(data))
    })

    return Posts
  }

  public async getSinglePost(
    queries: Booru.Structures.Requests.Queries.SinglePost
  ): Promise<Booru.Structures.Data.Processed.Response[]> {
    const Posts: Booru.Structures.Data.Processed.Post[] = []

    this.checkEndpointIsSupported(this.endpoints.singlePost)

    const URLToFetch = this.addQueriesToURL(
      this.endpoints.base + this.endpoints.singlePost,
      'single-post',
      queries
    )

    const data = await this.fetchAndParseData(URLToFetch, 'posts')

    this.checkForEmptyPostsData(data)

    data.forEach((data: Booru.Structures.Data.Raw.Post) => {
      Posts.push(this.createPost(data))
    })

    return Posts
  }

  public async getRandomPost(
    queries: Booru.Structures.Requests.Queries.RandomPost
  ): Promise<Booru.Structures.Data.Processed.Response[]> {
    const Posts: Booru.Structures.Data.Processed.Post[] = []

    this.checkEndpointIsSupported(this.endpoints.randomPost)

    const URLToFetch = this.addQueriesToURL(
      this.endpoints.base + this.endpoints.randomPost,
      'random-post',
      queries
    )

    const data = await this.fetchAndParseData(URLToFetch, 'posts')

    this.checkForEmptyPostsData(data)

    data.forEach((data: Booru.Structures.Data.Raw.Post) => {
      Posts.push(this.createPost(data))
    })

    return Posts
  }

  public async getTags(
    queries: Booru.Structures.Requests.Queries.Tags
  ): Promise<Booru.Structures.Data.Processed.Response[]> {
    this.checkEndpointIsSupported(this.endpoints.tags)

    const URLToFetch = this.addQueriesToURL(
      this.endpoints.base + this.endpoints.tags,
      'tags',
      queries
    )

    const data = await this.fetchAndParseData(URLToFetch, 'tags')

    this.checkForEmptyTagsData(data)

    const Tags = this.createTagArray(data, queries)

    return Tags
  }

  protected createTagArray(
    data: any,
    queries: Booru.Structures.Requests.Queries.Tags
  ): Booru.Structures.Data.Processed.Tag[] {
    const Tags: Booru.Structures.Data.Processed.Tag[] = []

    data.forEach((data: Booru.Structures.Data.Raw.Tag) => {
      Tags.push(this.createTag(data))
    })

    return Tags
  }

  protected abstract createPost(
    data: Booru.Structures.Data.Raw.Post
  ): Booru.Structures.Data.Processed.Post
  protected abstract createTag(
    data: Booru.Structures.Data.Raw.Tag
  ): Booru.Structures.Data.Processed.Tag

  protected async fetchAndParseData(
    URL: string,
    mode: 'posts' | 'tags'
  ): Promise<any[]> {
    let data = await FetchUtil(URL)

    try {
      data = JSON.parse(data)
    } catch (error) {
      debug('Response was not JSON')

      data = await XMLToJson(data, mode)
    }

    data = this.customFetchAndParseDataModification(data)

    return data
  }

  protected customFetchAndParseDataModification(data: any): any {
    // For any booru that wants to modify this method and its data in any way
    return data
  }

  protected checkEndpointIsSupported(endpoint: string | undefined): void {
    if (!endpoint)
      throw new GenericAPIError(
        'This type of booru doesnt support this functionality',
        undefined,
        400
      )
  }

  protected checkForEmptyPostsData(data: any[]): void {
    if (!data || !data.length) throw new EmptyDataError()
  }

  protected checkForEmptyTagsData(data: any[]): void {
    if (!data || !data.length) throw new EmptyDataError()
  }

  protected addQueriesToURL(
    URL: string,
    mode: 'posts' | 'single-post' | 'random-post' | 'tags',
    queries:
      | Booru.Structures.Requests.Queries.Posts
      | Booru.Structures.Requests.Queries.Tags
      | Booru.Structures.Requests.Queries.SinglePost
  ): string {
    // Add query appender
    URL += URL.includes('?') ? '&' : '?'

    switch (mode) {
      case 'posts':
        URL = this.addPostQueries(
          URL,
          queries as Booru.Structures.Requests.Queries.Posts
        )
        break

      case 'single-post':
        URL = this.addSinglePostQueries(
          URL,
          queries as Booru.Structures.Requests.Queries.SinglePost
        )
        break

      case 'random-post':
        URL = this.addRandomPostQueries(
          URL,
          queries as Booru.Structures.Requests.Queries.Posts
        )
        break

      case 'tags':
        URL = this.addTagsQueries(
          URL,
          queries as Booru.Structures.Requests.Queries.Tags
        )
        break

      default:
        throw new Error('No mode specified')
    }

    return URL
  }

  protected addPostQueries(
    URL: string,
    queries: Booru.Structures.Requests.Queries.Posts
  ): string {
    const { limit, pageID, tags, rating, score, order } = queries

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

        // case ' ': //TODO: this
        // case '+':

        // No '+' case because + gets encoded to space
        default:
          prefix = '+'
          tmpRating = rating
          break
      }

      URL += prefix + this.queryIdentifiers.posts.rating + ':' + tmpRating
    }

    // Order
    if (order && this.queryIdentifiers.posts.order) {
      URL += '+' + this.queryIdentifiers.posts.order + ':' + order
    }

    // Score
    if (score && this.queryIdentifiers.posts.score) {
      URL += '+' + this.queryIdentifiers.posts.score + ':' + score
    }

    return URL
  }

  protected addSinglePostQueries(
    URL: string,
    queries: Booru.Structures.Requests.Queries.SinglePost
  ): string {
    const { id } = queries

    URL += this.queryIdentifiers.singlePost.id + '=' + id

    return URL
  }

  protected addRandomPostQueries(
    URL: string,
    queries: Booru.Structures.Requests.Queries.Posts
  ): string {
    const { limit, pageID, tags, rating, score, order } = queries

    // Limit
    if (limit && this.queryIdentifiers.posts.limit)
      URL += this.queryIdentifiers.posts.limit + '=' + limit

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

    // Order random
    URL += '+' + this.queryIdentifiers.posts.order + ':' + 'random'

    // Score
    if (score && this.queryIdentifiers.posts.score) {
      URL += '+' + this.queryIdentifiers.posts.score + ':' + score
    }

    return URL
  }

  protected addTagsQueries(
    URL: string,
    queries: Booru.Structures.Requests.Queries.Tags
  ): string {
    const { tag, limit, pageID, order } = queries

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
      URL += '&' + this.queryIdentifiers.tags.order + '=' + order
    }

    // Raw methods to add
    if (this.queryIdentifiers.tags.raw) {
      URL += '&' + this.queryIdentifiers.tags.raw
    }

    return URL
  }
}
