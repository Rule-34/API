const express = require('express'),
  xmlToJsonFromUrl = require('../../utils/xmlToJsonFromUrl.js'),
  domainConfig = require('./domainConfig'),
  // Init
  router = express.Router(),
  debug = require('debug')(`loli tags`)

/* GET tags. */
router.get('/', async function(req, res, next) {
  // Get the requested parameters and create a url to request data with it
  const requestUrl = applyUrlParameters(req)
  debug(requestUrl)

  try {
    // Process through wich the xml request gets transformed to optimized json
    const jsonResult = await xmlToJsonFromUrl({
      url: requestUrl,
      template: 'tags',
      domain: 'loli',
      isJson: true
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
  const tag = req.query.tag,
    limit = req.query.limit || 25,
    pageId = req.query.pid || 0,
    order = req.query.order || 'count'

  // Return full url, no IFs because they already have defaults
  return (
    domainConfig.tagApiUrl +
    '?name=' +
    tag +
    '&limit=' +
    limit +
    '&page=' +
    pageId +
    '&order=' +
    order
  )
}

module.exports = router
