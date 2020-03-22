const express = require('express'),
  domainConfig = require('./domainConfig'),
  xmlToJsonFromUrl = require('@assets/utils/xmlToJsonFromUrl.js'),
  // Init
  router = express.Router(),
  debug = require('debug')(`paheal posts`)

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
      domain: 'paheal',
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
  const limit = req.query.limit || 20,
    pageId = req.query.pid,
    tags = req.query.tags || '',
    score = req.query.score

  // Return full url
  let builtUrl = domainConfig.apiUrl + 'post/index.xml' + '?limit=' + limit

  if (pageId) {
    builtUrl += '&pid=' + pageId
  }

  // Always add tags in case score is added
  builtUrl += '&tags=' + tags

  if (score) {
    builtUrl += '+score:>=' + score
  }

  // Return the complete built url
  return builtUrl
}

module.exports = router
