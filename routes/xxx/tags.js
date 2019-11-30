const express = require('express'),
  domainConfig = require('./domainConfig'),
  xmlToJsonFromUrl = require('../../utils/xmlToJsonFromUrl.js'),
  router = express.Router()

/* GET posts. */
router.get('/', async (req, res) => {
  // Get the requested parameters and create a url to request data with it
  const requestUrl = applyUrlParameters(req)
  console.log(requestUrl)

  // Process through wich the xml request gets transformed to optimized json
  let jsonResult = await xmlToJsonFromUrl(requestUrl, 'tags')

  // Reply to the client
  res.json(jsonResult)
})

// Separated applying of query parameters
function applyUrlParameters(req) {
  // Default query parameters
  const tag = req.query.tag || '',
    tagPattern = req.query.tag_pattern || '',
    order = req.query.order || 'count',
    limit = req.query.limit || 100

  // Return full url
  return (
    domainConfig.apiUrl +
    'tag&q=index' + // Tags api url
    '&name=' +
    tag +
    '&name_pattern=' +
    tagPattern +
    '&order=' +
    order +
    '&limit=' +
    limit
  )
}

module.exports = router
