const httpGet = require('../utils/HttpGet.js'),
  xmlToJson = require('../utils/xmlToJson.js'),
  jsonCleaner = require('../utils/jsonCleaner.js')

/**
 * Transform the passed url with the passed template
 * @param {String} url
 * @param {String} template
 * @param {String} domain
 * @param {Boolean} isJson
 * @param {Number} limit
 * @param {Boolean} useCorsProxy Should the request return the proxied url, defaults to true
 */
async function xmlToJsonFromUrl({
  url,
  template,
  domain,
  isJson,
  limit,
  useCorsProxy = false,
}) {
  // Initialize variable
  let json

  // First get XML from url
  const data = await httpGet(url)

  // Dont transform if its already JSON
  if (isJson) {
    json = data
  } else {
    json = await xmlToJson(data, domain)
  }

  // Then clean the JSON with the passed template, and return it
  return jsonCleaner({
    template,
    domain,
    json,
    limit,
    useCorsProxy,
  })
}

module.exports = xmlToJsonFromUrl
