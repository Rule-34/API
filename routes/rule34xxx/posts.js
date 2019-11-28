const express = require('express'),
  domainConfig = require('./domainConfig'),
  router = express.Router(),
  xmlToJsonFromUrl = require('../../utils/xmlToJsonFromUrl.js')

/* GET posts. */
router.get('/', async (req, res) => {
  // console.dir(result)

  // Query parameters
  const requestUrl = applyParameters(req)

  // Process through wich the xml request gets transformed to optimized json
  let result = await xmlToJsonFromUrl(requestUrl)

  // Reply to the client
  res.json(result)
})

// Separated applying of query parameters
function applyParameters(req) {
  // Default query parameters
  const limit = req.query.limit | 100,
    pageId = req.query.pid || 0,
    tags = req.query.tags || ''
  // score = req.query.score | 0,

  return (
    domainConfig.apiUrl + '&limit=' + limit + '&pid=' + pageId + '&tags=' + tags // + '&score:>=' score
  )
}

module.exports = router
