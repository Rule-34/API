import type { BooruHttpRequest } from '../../booru/interfaces/booru-http.interface'

function getFirstHeaderValue(value: string | string[] | undefined): string | undefined {
  const headerValue = Array.isArray(value) ? value[0] : value

  return headerValue
    ?.split(',')
    .map((part) => part.trim())
    .find(Boolean)
}

function getRequestProtocol(request: BooruHttpRequest): string {
  const protocol = request.protocol

  if (protocol === 'http' || protocol === 'https') {
    return protocol
  }

  if (protocol === 'http:' || protocol === 'https:') {
    return protocol.slice(0, -1)
  }

  return process.env['NODE_ENV'] === 'development' ? 'http' : 'https'
}

function getRequestHost(request: BooruHttpRequest): string {
  return getFirstHeaderValue(request.headers?.host) ?? request.hostname
}

export function createUrlFromRequest(request: BooruHttpRequest): string {
  return new URL(request.url, `${getRequestProtocol(request)}://${getRequestHost(request)}`).toString()
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
