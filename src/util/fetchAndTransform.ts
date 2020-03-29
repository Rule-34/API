import { httpFetch } from './httpFetch'
import { xmlToJson } from './xmlToJson'
import { jsonCleaner } from './jsonCleaner'

interface XmlToJsonFromUrl {
  url: string
  template: string
  domain: string
  isJson: boolean
  limit?: number
  useCorsProxy?: boolean
}

/**
 * Transform the passed url with the passed template
 * @param {String} url
 * @param {String} template
 * @param {String} domain
 * @param {Boolean} isJson
 * @param {Number} limit
 * @param {Boolean} useCorsProxy Should the request return the proxied url, defaults to true
 */
export default async function xmlToJsonFromUrl({
  url,
  template,
  domain,
  isJson,
  limit,
  useCorsProxy = false,
}: XmlToJsonFromUrl): Promise<object> {
  // Initialize variable
  let json: object

  // First get XML from url
  const data: string | object = await httpFetch(url)

  // Dont transform if its already JSON
  if (isJson) {
    json = data
  } else {
    json = await xmlToJson(data, domain)
  }

  // Then clean the JSON with the passed template, and return it
  return await jsonCleaner({
    template,
    domain,
    json,
    limit,
    useCorsProxy,
  })
}
