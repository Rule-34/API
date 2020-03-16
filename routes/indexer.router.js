const express = require('express'),
  router = express.Router(),
  // Middleware
  { queryValidate } = require('../middleware/query_validation/validate.js'),
  { postsValidation } = require('../middleware/query_validation/posts.js'),
  { tagsValidation } = require('../middleware/query_validation/tags.js'),
  {
    singlePostValidation
  } = require('../middleware/query_validation/singlePost.js'),
  // Import all routes
  defaultRouter = require('./default'),
  // debug = require('debug')(`Indexer`),
  fs = require('fs')

// All routes are added here
router
  /* GET /health-check - Check service health */
  // .get('/health-check', (req, res) => res.send('OK'))

  // Default router
  .use('/', defaultRouter)
  // Middleware checking
  .use('/*/posts', postsValidation(), queryValidate)
  .use('/*/single-post', singlePostValidation(), queryValidate)
  .use('/*/tags', tagsValidation(), queryValidate)

// Dynamic routes
fs.readdirSync(__dirname, { withFileTypes: true })
  .filter((dir) => dir.isDirectory())
  .map((dir) =>
    router.use(`/${dir.name}`, require(`./${dir.name}/index.routes.js`))
  )

// Export default
module.exports = router
