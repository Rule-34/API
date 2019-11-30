const express = require('express'),
  xmlToJsonFromUrl = require('../../utils/xmlToJsonFromUrl.js'),
  domainConfig = require('./domainConfig'),
  router = express.Router()

/* GET tags. */
router.get('/', async (req, res) => {
  // If theres no query then return and dont execute anything
  if (!req.query.tag) {
    res.json({ error: 'You should add a query' })
  } else {
    // Get the requested parameters and create a url to request data with it
    const requestUrl = applyUrlParameters(req)
    console.log(requestUrl)

    // Define limit of posts to return to client
    const limit = req.query.limit || 100

    // Process through wich the json gets transformed to optimized json
    let jsonResult = await xmlToJsonFromUrl(
      requestUrl,
      'autocomplete',
      'xxx',
      limit
    )

    // Reply to the client
    res.json(jsonResult)
  }
})

// Separated applying of query parameters
function applyUrlParameters(req) {
  // Default query parameters
  const tag = req.query.tag || ''

  // Return full url
  return domainConfig.tagApiUrl + 'q=' + tag
}

module.exports = router
