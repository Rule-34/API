import type { BooruHttpRequest } from '../../booru/interfaces/booru-http.interface'

export function createUrlFromRequest(request: BooruHttpRequest): string {
  const hostname = request.hostname
  const originalUrl = request.url

  // TODO: Do not hardcode protocol
  const protocol = process.env['NODE_ENV'] === 'development' ? 'http' : 'https'

  return `${protocol}://${hostname}${originalUrl}`
}

export function createPreviousPageUrl(
  request: BooruHttpRequest,
  pageID: number | null | undefined,
  initialPageID: number
): string | null {
  const url = new URL(createUrlFromRequest(request))

  if (pageID == null) {
    return null
  }

  const previousPageID = pageID - 1

  if (previousPageID < initialPageID) {
    return null
  }

  url.searchParams.set('pageID', previousPageID.toString())

  return url.toString()
}

export function createNextPageUrl(request: BooruHttpRequest, pageID: number | null | undefined): string | null {
  const url = new URL(createUrlFromRequest(request))

  if (pageID == null) {
    return null
  }

  const nextPageID = pageID + 1

  url.searchParams.set('pageID', nextPageID.toString())

  return url.toString()
}

export function createFirstPageUrl(request: BooruHttpRequest, initialPageID: number | null | undefined): string | null {
  const url = new URL(createUrlFromRequest(request))

  if (initialPageID == null) {
    return null
  }

  url.searchParams.set('pageID', initialPageID.toString())

  return url.toString()
}
