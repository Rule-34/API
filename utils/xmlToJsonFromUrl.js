const httpGet = require('../utils/HttpGet.js'),
  xmlToJson = require('../utils/xmlToJson.js'),
  jsonCleaner = require('../utils/jsonCleaner.js')

async function xmlToJsonFromUrl(url) {
  // First get XML from url
  const xmlData = await httpGet(url)

  // Then transform to Json with camaro // THANKS A LOT @tuananh
  const jsonData = await xmlToJson(xmlData)

  // Then beautify json
  const cleanJson = jsonCleaner(jsonData)

  // And return it
  return cleanJson
}

module.exports = xmlToJsonFromUrl
