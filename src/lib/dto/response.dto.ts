import { BooruPostObject, BooruTagObject, BooruTypes } from '@alejandroakbal/universal-booru-wrapper'
import {
  booruQueryValuesPostsDTO,
  booruQueryValuesRandomPostsDTO,
  booruQueryValuesSinglePostDTO,
  booruQueryValuesTagsDTO
} from '../../booru/dto/booru-queries.dto'
import type { BooruHttpRequest } from '../../booru/interfaces/booru-http.interface'
import { createFirstPageUrl, createNextPageUrl, createPreviousPageUrl, createUrlFromRequest } from '../support/url'

type PaginatedResponseQuery = booruQueryValuesPostsDTO | booruQueryValuesRandomPostsDTO | booruQueryValuesTagsDTO

export class ResponseDto {
  readonly data: unknown[]

  readonly meta: {
    items_count: number

    total_items: number | null

    current_page: number | null

    total_pages: number | null

    items_per_page: number | null
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
    request: BooruHttpRequest,
    queries:
      | booruQueryValuesPostsDTO
      | booruQueryValuesSinglePostDTO
      | booruQueryValuesRandomPostsDTO
      | booruQueryValuesTagsDTO,
    booruApi: BooruTypes,
    posts: BooruPostObject[] | BooruTagObject[]
  ) {
    let meta: ResponseDto['meta']

    switch (true) {
      case queries instanceof booruQueryValuesPostsDTO:
      case queries instanceof booruQueryValuesRandomPostsDTO:
      case queries instanceof booruQueryValuesTagsDTO:
        meta = {
          items_count: posts.length,

          total_items: null,

          current_page: queries.pageID ?? null,

          total_pages: null,

          items_per_page: queries.limit ?? null
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

    let links: ResponseDto['links']

    switch (true) {
      case queries instanceof booruQueryValuesPostsDTO:
      case queries instanceof booruQueryValuesRandomPostsDTO:
      case queries instanceof booruQueryValuesTagsDTO: {
        const paginatedQueries: PaginatedResponseQuery = queries
        links = {
          self: createUrlFromRequest(request),

          first: createFirstPageUrl(request, booruApi.booruType.initialPageID),
          last: null,

          prev: createPreviousPageUrl(request, paginatedQueries.pageID, booruApi.booruType.initialPageID),
          next: createNextPageUrl(request, paginatedQueries.pageID)
        }
        break
      }

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
