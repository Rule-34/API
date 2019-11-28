const httpGet = require('../utils/HttpGet.js'),
  xmlToJson = require('../utils/xmlToJson.js')

async function xmlToJsonFromUrl(url) {
  // console.log(url)

  // First get XML from url and then transform xml to json
  const xmlData = await httpGet(url)
  console.log('XML DATA IS', xmlData)

  const jsonData = await xmlToJson(xmlData)
  console.log('JSON DATA IS', jsonData)

  return jsonData
}

module.exports = xmlToJsonFromUrl
