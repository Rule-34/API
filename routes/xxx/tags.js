const express = require('express'),
  domainConfig = require('./domainConfig'),
  xmlToJsonFromUrl = require('../../utils/xmlToJsonFromUrl.js'),
  router = express.Router()

/* GET posts. */
router.get('/', async (req, res) => {
  // console.dir(result)

  // Get the requested parameters and create a url to request data with it
  const requestUrl = applyUrlParameters(req)

  // Process through wich the xml request gets transformed to optimized json
  let jsonResult = await xmlToJsonFromUrl(requestUrl)

  // Reply to the client
  res.json(jsonResult)
})

// Separated applying of query parameters
function applyUrlParameters(req) {
  // Default query parameters
  const tags = req.query.tags || '',
    order_by = req.query.order_by || 'index_count',
    limit = req.query.limit || 100

  // Return full url
  return (
    domainConfig.apiUrl +
    'tag&q=index' + // Tags api url
    '&tags=' +
    tags +
    '&order_by=' +
    order_by +
    '&limit=' + // TODO: Make this work
    limit
  )
}

module.exports = router
