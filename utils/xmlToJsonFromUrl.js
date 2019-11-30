const httpGet = require('../utils/HttpGet.js'),
  xmlToJson = require('../utils/xmlToJson.js'),
  jsonCleaner = require('../utils/jsonCleaner.js')

// Transform the passed url with the passed template
async function xmlToJsonFromUrl(url, template) {
  // First get XML from url
  const xmlData = await httpGet(url)

  // Then transform to Json with the passed template thanks to camaro // THANKS A LOT @tuananh
  const jsonData = await xmlToJson(xmlData, template)

  // Then beautify json with the passed template
  const cleanJson = jsonCleaner(jsonData, template)

  // And return it
  return cleanJson
}

module.exports = xmlToJsonFromUrl
