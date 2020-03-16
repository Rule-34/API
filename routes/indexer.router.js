const express = require('express'),
  router = express.Router(),
  // Middleware
  { validationRules, validate } = require('../middleware/queryValidation.js'),
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
  .use('/*/posts', validationRules(), validate)

// Dynamic routes
fs.readdirSync(__dirname, { withFileTypes: true })
  .filter((dir) => dir.isDirectory())
  .map((dir) =>
    router.use(`/${dir.name}`, require(`./${dir.name}/index.routes.js`))
  )

// Export default
module.exports = router
