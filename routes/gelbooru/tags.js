const express = require('express'),
  xmlToJsonFromUrl = require('../../utils/xmlToJsonFromUrl.js'),
  domainConfig = require('./domainConfig'),
  router = express.Router(),
  { check, validationResult } = require('express-validator'),
  debug = require('debug')(`gelbooru tags`)

/* GET tags. */
router.get(
  '/',
  [
    check('tag')
      .isString()
      .notEmpty(),
    check('limit')
      .isInt()
      .optional(),
    check('order')
      .isString()
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

    // Define limit of posts to return to client

    // Process through wich the json gets transformed to optimized json
    let jsonResult = await xmlToJsonFromUrl({
      url: requestUrl,
      template: 'tags',
      domain: 'gelbooru',
      isJson: true,
    })

    // Reply to the client
    res.json(jsonResult)
  }
)

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
