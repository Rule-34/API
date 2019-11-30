const httpGet = require('../utils/HttpGet.js'),
  jsonCleaner = require('../utils/jsonCleaner.js')

// Transform the passed url with the passed template
async function cleanAutoComplete(url, domain, limit) {
  // First get XML from url
  const jsonData = await httpGet(url)

  // Then beautify json with the passed template
  const cleanJson = jsonCleaner(jsonData, 'autocomplete', domain, limit)

  // And return it
  return cleanJson
}

module.exports = cleanAutoComplete
