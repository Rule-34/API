const httpGet = require('../utils/HttpGet.js'),
  xmlToJson = require('../utils/xmlToJson.js'),
  jsonCleaner = require('../utils/jsonCleaner.js')

// Transform the passed url with the passed template
async function xmlToJsonFromUrl(url, template, domain, limit) {
  // First get XML from url
  const xmlData = await httpGet(url)

  let jsonData
  // Dont transform if theres limit cause that means its a tag autocomplete json
  switch (limit) {
    case true:
      jsonData = xmlData
      break

    // Then transform to Json with the passed template thanks to camaro // THANKS A LOT @tuananh
    default:
      jsonData = await xmlToJson(xmlData, domain)
      break
  }

  // Then beautify json with the passed template
  const cleanJson = jsonCleaner(jsonData, template, domain, limit)

  // And return it
  return cleanJson
}

module.exports = xmlToJsonFromUrl
