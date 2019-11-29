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
  const limit = req.query.limit || 100,
    pageId = req.query.pid || 0,
    tags = req.query.tags || '',
    score = req.query.score | 0

  // Return full url
  return (
    domainConfig.apiUrl +
    '&limit=' +
    limit +
    '&pid=' +
    pageId +
    '&tags=' +
    tags +
    '+score:>=' +
    score
  )
}

module.exports = router
