const express = require('express'),
  domainConfig = require('./domainConfig'),
  xmlToJsonFromUrl = require('@assets/utils/xmlToJsonFromUrl.js'),
  // Init
  router = express.Router(),
  debug = require('debug')(`xxx posts`)

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
      domain: 'safebooru',
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
    tags = encodeURIComponent(req.query.tags),
    rating = req.query.rating,
    score = req.query.score

  // Return full url
  let builtUrl = domainConfig.apiUrl + 'post&q=index' + '&limit=' + limit

  if (pageId) {
    builtUrl += '&pid=' + pageId
  }

  // Weird encodeURIComponent workflow, because this doesnt have a default
  if (tags === 'undefined') {
    builtUrl += '&tags='
  } else {
    builtUrl += '&tags=' + tags
  }

  if (rating) {
    // Test if it starts with a minus
    const prefix = rating.startsWith('-') ? '-' : '+'

    // Unused as we cant use multiple rating
    // rating.split(/(?=\s|-)/g)

    builtUrl += prefix + 'rating:' + rating.substring(1)
  }

  if (score) {
    builtUrl += '+score:>=' + score
  }

  // Return the complete built url
  return builtUrl
}

module.exports = router
