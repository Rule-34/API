const express = require('express'),
  router = express.Router(),
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

// Dynamic routes
fs.readdirSync(__dirname, { withFileTypes: true })
  .filter(dir => dir.isDirectory())
  .map(dir =>
    router.use(`/${dir.name}`, require(`./${dir.name}/index.routes.js`))
  )

// Export default
module.exports = router
