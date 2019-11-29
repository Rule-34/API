const httpGet = require('../utils/HttpGet.js')
const jsonCleaner = require('../utils/jsonCleaner.js')
const { transform } = require('camaro')

const template = {
  count: 'number(/posts/@count)',
  posts: ['/posts/post', {
    id: 'number(@id)',
    high_res_file: '@file_url',
    low_res_file: '@sample_url',
    preview_file: '@preview_url',
    tags: '@tags',
    type: ''
  }]
}
async function xmlToJsonFromUrl(url) {
  // console.log(url)
  // First get XML from url
  const xmlData = await httpGet(url)
  // console.log('XML DATA IS', xmlData)

  // Then transform to Json
  const jsonData = await transform(xmlData, template)
  // console.log('JSON DATA IS', jsonData)

  // Then beautify json
  const cleanJson = jsonCleaner(jsonData)

  // And return it
  return cleanJson
}

module.exports = xmlToJsonFromUrl
