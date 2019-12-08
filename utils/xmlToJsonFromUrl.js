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
 */
async function xmlToJsonFromUrl(url, template, domain, isJson, limit) {
  let jsonData

  // First get XML from url
  const xmlData = await httpGet(url)

  // Dont transform if theres limit cause that means its a tag autocomplete json
  if (isJson) {
    jsonData = xmlData
  } else {
    jsonData = await xmlToJson(xmlData, template, domain)
  }

  // Then beautify json with the passed template
  const cleanJson = jsonCleaner(jsonData, template, domain, limit, isJson)

  // And return it
  return cleanJson
}

module.exports = xmlToJsonFromUrl
