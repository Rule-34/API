const express = require('express'),
  domainConfig = require('./domainConfig'),
  xmlToJsonFromUrl = require('../../utils/xmlToJsonFromUrl.js'),
  router = express.Router(),
  { check, validationResult } = require('express-validator'),
  debug = require('debug')(`gelbooru posts`)

/* GET posts. */
router.get(
  '/',
  [
    check('limit')
      .isInt()
      .optional(),
    check('pid')
      .isInt()
      .optional(),
    check('tags')
      .isString()
      .optional(),
    check('rating')
      .isString()
      .optional(),
    check('score')
      .isInt()
      .optional(),
    check('corsProxy')
      .isBoolean()
      .toBoolean()
      .optional(),
  ],
  async function(req, res) {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    // Get the requested parameters and create a url to request data with it
    const requestUrl = applyUrlParameters(req)
    debug(requestUrl)

    // Process through wich the xml request gets transformed to optimized json
    let jsonResult = await xmlToJsonFromUrl({
      url: requestUrl,
      template: 'posts',
      domain: 'gelbooru',
      useCorsProxy: req.query.corsProxy,
    })

    // Reply to the client
    res.json(jsonResult)
  }
)

// Separated applying of query parameters
function applyUrlParameters(req) {
  // Default query parameters
  const limit = req.query.limit || 100, // Default is 100
    pageId = req.query.pid, // Default is ?
    tags = encodeURIComponent(req.query.tags), // Default is ''
    rating = req.query.rating,
    score = req.query.score // Default is 0

  // Return full url
  let builtUrl = domainConfig.apiUrl + '&limit=' + limit

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

    builtUrl += prefix + 'rating:' + rating.substring(1)
  }

  if (score) {
    builtUrl += '+score:>=' + score
  }

  // Return the complete built url
  return builtUrl
}

module.exports = router
