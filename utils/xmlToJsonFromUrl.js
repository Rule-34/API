const httpGet = require('../utils/HttpGet.js'),
  xmlToJson = require('../utils/xmlToJson.js'),
  jsonCleaner = require('../utils/jsonCleaner.js')

async function xmlToJsonFromUrl(url) {
  // console.log(url)
  // First get XML from url
  const xmlData = await httpGet(url)
  // console.log('XML DATA IS', xmlData)

  // Then transform to Json
  const jsonData = await xmlToJson(xmlData)
  // console.log('JSON DATA IS', jsonData)

  // Then beautify json
  const cleanJson = await jsonCleaner(jsonData)

  // And return it
  return cleanJson
}

module.exports = xmlToJsonFromUrl
