import httpFetch from './httpFetch'
import xmlToJson from './xmlToJson'
import jsonCleaner from './json-cleaner'

// Definitions
import { PassedData } from '@/types/passed-data'

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
}: PassedData): Promise<Array<object>> => {
  // First fetch data
  let data: string | object = await httpFetch(url)

  // Transform if data is JSON
  if (!isJson) {
    data = await xmlToJson(data)
  }

  // Then clean the JSON with the passed template, and return it
  return await jsonCleaner({
    template,
    domain,
    data,
    limit,
    useCorsProxy,
  })
}
