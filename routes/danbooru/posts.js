const express = require('express'),
  domainConfig = require('./domainConfig'),
  xmlToJsonFromUrl = require('../../utils/xmlToJsonFromUrl.js'),
  router = express.Router(),
  { check, validationResult } = require('express-validator'),
  debug = require('debug')(`danbooru posts`)

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
    check('score')
      .isInt()
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
    let jsonResult = await xmlToJsonFromUrl(
      requestUrl,
      'posts',
      'danbooru',
      true
    )

    // Reply to the client
    res.json(jsonResult)
  }
)

// Separated applying of query parameters
function applyUrlParameters(req) {
  // Default query parameters
  const limit = req.query.limit || 100,
    pageId = req.query.pid || 0,
    tags = req.query.tags || '',
    score = req.query.score | 0

  // Return full url
  let builtUrl = domainConfig.apiUrl + '?limit=' + limit

  if (pageId) {
    builtUrl += '&page=' + pageId
  }
  if (tags) {
    builtUrl += '&tags=' + tags
  }
  if (score) {
    builtUrl += '+score:>=' + score
  }

  // Return the complete built url
  return builtUrl
}

module.exports = router