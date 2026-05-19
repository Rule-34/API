import type { BooruPostObject, BooruTagObject, BooruTypes } from '@alejandroakbal/universal-booru-wrapper'
import {
  booruQueryValuesPostsDTO,
  booruQueryValuesRandomPostsDTO,
  booruQueryValuesTagsDTO
} from '../../booru/dto/booru-queries.dto'
import type { booruQueryValuesSinglePostDTO } from '../../booru/dto/booru-queries.dto'
import type { BooruHttpRequest } from '../../booru/interfaces/booru-http.interface'
import { createFirstPageUrl, createNextPageUrl, createPreviousPageUrl, createUrlFromRequest } from '../support/url'

type PaginatedResponseQuery = booruQueryValuesPostsDTO | booruQueryValuesRandomPostsDTO | booruQueryValuesTagsDTO
type ControllerResponseQuery = PaginatedResponseQuery | booruQueryValuesSinglePostDTO

function isPaginatedResponseQuery(queries: ControllerResponseQuery): queries is PaginatedResponseQuery {
  return (
    queries instanceof booruQueryValuesPostsDTO ||
    queries instanceof booruQueryValuesRandomPostsDTO ||
    queries instanceof booruQueryValuesTagsDTO
  )
}

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
    queries: ControllerResponseQuery,
    booruApi: BooruTypes,
    posts: BooruPostObject[] | BooruTagObject[]
  ): ResponseDto {
    const isPaginatedQuery = isPaginatedResponseQuery(queries)
    const meta: ResponseDto['meta'] = isPaginatedQuery
      ? {
          items_count: posts.length,

          total_items: null,

          current_page: queries.pageID ?? null,

          total_pages: null,

          items_per_page: queries.limit ?? null
        }
      : {
          items_count: posts.length,

          total_items: null,

          current_page: null,

          total_pages: null,

          items_per_page: null
        }

    const links: ResponseDto['links'] = isPaginatedQuery
      ? {
          self: createUrlFromRequest(request),

          first: createFirstPageUrl(request, booruApi.booruType.initialPageID),
          last: null,

          prev: createPreviousPageUrl(request, queries.pageID, booruApi.booruType.initialPageID),
          next: createNextPageUrl(request, queries.pageID)
        }
      : {
          self: createUrlFromRequest(request),

          first: null,
          last: null,

          prev: null,
          next: null
        }

    return new ResponseDto(
      posts,

      meta,

      links
    )
  }
}
