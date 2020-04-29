import he from 'he'

import httpFetch from '../httpFetch'
import xmlToJson from './customXMLToJson'
import jsonCleaner from '../json-cleaner'

/**
 * Transform the passed url with the passed template
 * @param {String} url
 * @param {String} template
 * @param {String} domain
 * @param {Boolean} isJson
 * @param {Number} limit
 * @param {Boolean} useCorsProxy Should the request return the proxied url, defaults to true
 */
export default async ({
  queryObj,
  desiredEndpoint: requestedEndpoint,
}): Promise<Array<object>> => {
  // General
  const { HTTPScheme, host, booruType } = queryObj

  let URLToFetch, responseIsJSON

  // Deestructure queries
  // POSTS
  const limit = queryObj.limit ?? 20,
    pageID = queryObj.pid,
    tags = queryObj.tags,
    rating = queryObj.rating,
    score = queryObj.score,
    order = queryObj.order,
    // SINGLE POST
    postID = queryObj.postID,
    // TAGS
    tag = queryObj.tag

  switch (booruType) {
    // BOORU
    case 'shimmie':
      // ENDPOINT
      switch (requestedEndpoint) {
        // POSTS
        case 'posts':
          // Init values
          responseIsJSON = false

          URLToFetch = HTTPScheme + host + '/api/danbooru/post/index.xml'

          // QUERIES
          URLToFetch += '?' + 'limit=' + limit

          if (pageID) {
            URLToFetch += '&' + 'pid=' + pageID
          }

          if (tags) {
            URLToFetch += '&' + 'tags=' + tags
          }

          if (score) {
            if (!tags) URLToFetch += '&' + 'tags='

            URLToFetch += '+score:' + score
          }
          break

        // SINGLE POST
        case 'single-post':
          // Init values
          responseIsJSON = false

          URLToFetch = HTTPScheme + host + '/api/danbooru/post/index.xml'

          // QUERIES
          URLToFetch += '?' + 'id=' + postID
          break

        // TAGS
        case 'tags':
          // Init values
          responseIsJSON = true

          URLToFetch = HTTPScheme + host + '/api/internal/autocomplete'

          // QUERIES
          URLToFetch += '?' + 's=' + tag
          break

        // RANDOM POST
        case 'random-post':
          // Init values
          responseIsJSON = false

          URLToFetch = undefined
          break

        default:
          throw new Error('No endpoint specified')
      }

      break

    default:
      throw new Error('No known booru type')
  }

  // First fetch data
  let fetchData = await httpFetch(URLToFetch)

  // Transform if data is JSON
  if (!responseIsJSON) {
    fetchData = await xmlToJson(fetchData, 'shimmie')
  }

  // Decode HTML chars
  fetchData = he.decode(fetchData)

  // Then clean the JSON with the passed template, and return it
  return await jsonCleaner({
    template,
    domain,
    data: fetchData,
    limit,
    useCorsProxy,
  })
}
