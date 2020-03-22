const express = require('express'),
  xmlToJsonFromUrl = require('@assets/utils/xmlToJsonFromUrl.js'),
  domainConfig = require('./domainConfig'),
  router = express.Router(),
  debug = require('debug')(`gelbooru tags`)

/* GET tags. */
router.get('/', async function (req, res, next) {
  // Get the requested parameters and create a url to request data with it
  const requestUrl = applyUrlParameters(req)
  debug(requestUrl)

  try {
    // Process through wich the xml request gets transformed to optimized json
    const jsonResult = await xmlToJsonFromUrl({
      url: requestUrl,
      template: 'tags',
      domain: 'gelbooru',
      isJson: true,
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
  const tag = encodeURIComponent(req.query.tag),
    limit = req.query.limit || 25,
    order = req.query.order || 'count'

  // Return full url, no IFs because they already have defaults
  return (
    domainConfig.tagApiUrl +
    '&json=1' +
    '&name_pattern=' +
    tag +
    '&limit=' +
    limit +
    '&orderby=' +
    order
  )
}

module.exports = router
