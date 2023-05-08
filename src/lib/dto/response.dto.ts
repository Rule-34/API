import { BooruPostObject, BooruTagObject, BooruTypes } from '@alejandroakbal/universal-booru-wrapper'
import {
  booruQueryValuesPostsDTO,
  booruQueryValuesRandomPostsDTO,
  booruQueryValuesSinglePostDTO,
  booruQueryValuesTagsDTO
} from '../../booru/dto/booru-queries.dto'
import { createFirstPageUrl, createNextPageUrl, createPreviousPageUrl, createUrlFromRequest } from '../support/url'

export class ResponseDto {
  readonly data: unknown[]

  readonly meta: {
    items_count: number

    total_items: number | null

    current_page: number

    total_pages: number | null

    items_per_page: number
  }

  readonly links: {
    self: string | null

    first: string | null
    last: string | null

    prev: string | null
    next: string | null
  }

  constructor(data: ResponseDto['data'], meta: ResponseDto['meta'], links: ResponseDto['links']) {
    this.data = data
    this.meta = meta
    this.links = links
  }

  public static createFromController(
    request,
    queries:
      | booruQueryValuesPostsDTO
      | booruQueryValuesSinglePostDTO
      | booruQueryValuesRandomPostsDTO
      | booruQueryValuesTagsDTO,
    booruApi: BooruTypes,
    posts: BooruPostObject[] | BooruTagObject[]
  ) {
    let meta = null

    switch (true) {
      case queries instanceof booruQueryValuesPostsDTO:
      case queries instanceof booruQueryValuesRandomPostsDTO:
      case queries instanceof booruQueryValuesTagsDTO:
        meta = {
          items_count: posts.length,

          total_items: null,

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          current_page: queries.pageID,

          total_pages: null,

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          items_per_page: queries.limit
        }
        break

      case queries instanceof booruQueryValuesSinglePostDTO:
        meta = {
          items_count: posts.length,

          total_items: null,

          current_page: null,

          total_pages: null,

          items_per_page: null
        }
        break

      default:
        throw new Error('Invalid query type')
    }

    let links = null

    switch (true) {
      case queries instanceof booruQueryValuesPostsDTO:
      case queries instanceof booruQueryValuesRandomPostsDTO:
      case queries instanceof booruQueryValuesTagsDTO:
        links = {
          self: createUrlFromRequest(request),

          first: createFirstPageUrl(request, booruApi.booruType.initialPageID),
          last: null,

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          prev: createPreviousPageUrl(request, queries.pageID, booruApi.booruType.initialPageID),
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          next: createNextPageUrl(request, queries.pageID)
        }
        break

      case queries instanceof booruQueryValuesSinglePostDTO:
        links = {
          self: createUrlFromRequest(request),

          first: null,
          last: null,

          prev: null,
          next: null
        }
        break

      default:
        throw new Error('Invalid query type')
    }

    return new ResponseDto(
      posts,

      meta,

      links
    )
  }
}
