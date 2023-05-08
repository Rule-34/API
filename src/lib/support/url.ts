import { FastifyRequest } from 'fastify'

export function createUrlFromRequest(request: FastifyRequest) {
  const protocol = request.protocol
  const hostname = request.hostname
  const originalUrl = request.url

  return `${protocol}://${hostname}${originalUrl}`
}

export function createPreviousPageUrl(request: FastifyRequest, pageID: number, initialPageID: number) {
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

export function createNextPageUrl(request: FastifyRequest, pageID: number) {
  const url = new URL(createUrlFromRequest(request))

  if (pageID == null) {
    return null
  }

  const nextPageID = pageID + 1

  url.searchParams.set('pageID', nextPageID.toString())

  return url.toString()
}

export function createFirstPageUrl(request: FastifyRequest, initialPageID: number) {
  const url = new URL(createUrlFromRequest(request))

  if (initialPageID == null) {
    return null
  }

  url.searchParams.set('pageID', initialPageID.toString())

  return url.toString()
}
