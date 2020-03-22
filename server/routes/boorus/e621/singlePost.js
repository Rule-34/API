const express = require('express'),
  domainConfig = require('./domainConfig'),
  xmlToJsonFromUrl = require('@assets/utils/xmlToJsonFromUrl.js'),
  // Init
  router = express.Router(),
  debug = require('debug')(`e621 single-post`)

/* GET posts. */
router.get('/', async function (req, res, next) {
  // Get the requested parameters and create a url to request data with it
  const requestUrl = applyUrlParameters(req)
  debug(requestUrl)

  try {
    // Process through wich the xml request gets transformed to optimized json
    const jsonResult = await xmlToJsonFromUrl({
      url: requestUrl,
      template: 'posts',
      domain: 'e621-single',
      isJson: true,
      useCorsProxy: req.query.corsProxy,
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
  const postId = req.query.id

  // Return full url
  let builtUrl = domainConfig.apiUrl + '/' + postId + '.json'

  // Return the complete built url
  return builtUrl
}

module.exports = router
