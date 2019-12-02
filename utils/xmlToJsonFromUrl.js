const httpGet = require('../utils/HttpGet.js'),
  xmlToJson = require('../utils/xmlToJson.js'),
  jsonCleaner = require('../utils/jsonCleaner.js')

// Transform the passed url with the passed template
async function xmlToJsonFromUrl(url, template, domain, limit) {
  // First get XML from url
  const xmlData = await httpGet(url)

  let jsonData
  // Dont transform if theres limit cause that means its a tag autocomplete json
  if (limit) {
    jsonData = JSON.parse(xmlData)
  } else {
    jsonData = await xmlToJson(xmlData, domain)
  }

  // Then beautify json with the passed template
  const cleanJson = jsonCleaner(jsonData, template, domain, limit)

  // And return it
  return cleanJson
}

module.exports = xmlToJsonFromUrl
