const express = require('express'),
  xmlToJsonFromUrl = require('@assets/utils/xmlToJsonFromUrl.js'),
  domainConfig = require('./domainConfig'),
  // Init
  router = express.Router(),
  debug = require('debug')(`xxx tags`)

/* GET tags. */
router.get('/', async function (req, res, next) {
  // Get the requested parameters and create a url to request data with it
  const requestUrl = applyUrlParameters(req)
  debug(requestUrl)

  // Define limit of posts to return to client
  const limit = req.query.limit || 25

  try {
    // Process through wich the json gets transformed to optimized json
    let jsonResult = await xmlToJsonFromUrl({
      url: requestUrl,
      template: 'autocomplete',
      domain: 'xxx',
      isJson: true,
      limit,
    })

    // Reply
    res.json(jsonResult)

    // Pass error to middleware
  } catch (error) {
    next(error)
  }
})

// Separated applying of query parameters
function applyUrlParameters(req) {
  // Default query parameters
  const tag = encodeURIComponent(req.query.tag)

  // Return full url
  return domainConfig.tagApiUrl + 'q=' + tag
}

module.exports = router
