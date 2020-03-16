const express = require('express'),
  domainConfig = require('./domainConfig'),
  xmlToJsonFromUrl = require('../../utils/xmlToJsonFromUrl.js'),
  // Init
  router = express.Router(),
  debug = require('debug')(`e621 posts`)

/* GET posts. */
router.get('/', async function(req, res, next) {
  // Get the requested parameters and create a url to request data with it
  const requestUrl = applyUrlParameters(req)
  debug(requestUrl)

  try {
    // Process through wich the xml request gets transformed to optimized json
    const jsonResult = await xmlToJsonFromUrl({
      url: requestUrl,
      template: 'posts',
      domain: 'e621',
      isJson: true,
      useCorsProxy: req.query.corsProxy
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
    tags = encodeURIComponent(req.query.tags),
    rating = req.query.rating,
    score = req.query.score

  // Return full url
  let builtUrl =
    domainConfig.apiUrl +
    '.json?' +
    domainConfig.userAgent + // Necessary for this site's API
    '&limit=' +
    limit

  if (pageId) {
    builtUrl += '&page=' + pageId
  }

  // Always add tags in case score is added

  // Weird encodeURIComponent workflow, because this doesnt have a default, because this doesnt have a default
  if (tags === 'undefined') {
    builtUrl += '&tags='
  } else {
    builtUrl += '&tags=' + tags
  }

  if (rating) {
    // Test if it starts with a minus
    const prefix = rating.startsWith('-') ? '-' : '+'

    builtUrl += prefix + 'rating:' + rating.substring(1)
  }

  if (score) {
    builtUrl += '+score:>=' + score
  }

  // Return the complete built url
  return builtUrl
}

module.exports = router
