const httpGet = require('../utils/HttpGet.js'),
  xmlToJson = require('../utils/xmlToJson.js')

async function xmlToJsonFromUrl(url) {
  // console.log(url)
  // First get XML from url
  const xmlData = await httpGet(url)
  // console.log('XML DATA IS', xmlData)

  // Then transform to Json
  const jsonData = await xmlToJson(xmlData)
  // console.log('JSON DATA IS', jsonData)

  // Then beautify json

  return jsonData
}

module.exports = xmlToJsonFromUrl
