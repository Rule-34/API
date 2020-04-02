import he from 'he'

import httpFetch from './httpFetch'
import xmlToJson from './xmlToJson'
import jsonCleaner from './json-cleaner'

// Definitions
import { IPassedData } from 'passed-data.interface'

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
  url,
  template,
  domain,
  isJson,
  limit,
  useCorsProxy = false,
}: IPassedData): Promise<Array<object>> => {
  // First fetch data
  let data = await httpFetch(url)

  // Transform if data is JSON
  if (!isJson) {
    data = await xmlToJson(data)
  }

  // Decode HTML chars
  data = he.decode(data)

  // Then clean the JSON with the passed template, and return it
  return await jsonCleaner({
    template,
    domain,
    data,
    limit,
    useCorsProxy,
  })
}
