const express = require('express'),
  apicache = require('apicache'),
  router = express.Router(),
  // Import all routes // TODO: use glob to match *.route files
  defaultRouter = require('./default'),
  imagesRouter = require('./images'),
  xxxRoutes = require('./xxx/index.routes.js'),
  pahealRoutes = require('./paheal/index.routes.js'),
  loliRoutes = require('./loli/index.routes.js')

/*
 ** All routes are used from here
 */
router
  // Error debugger
  /*.get('*', function(req, res, next) { 
    // Reporting async errors *must* go through `next()`
    setImmediate(() => {
      next(new Error('woops'))
    })
  }) */
  /* GET /health-check - Check service health */
  .get('/health-check', (req, res) => res.send('OK'))
  .get('/cache/performance', (req, res) => {
    res.json(apicache.getPerformance())
  })
  // add route to display cache index
  .get('/cache/index', (req, res) => {
    res.json(apicache.getIndex())
  })
  .use('/', defaultRouter)
  .use('/images', imagesRouter)
  .use('/xxx/', xxxRoutes)
  .use('/paheal/', pahealRoutes)
  .use('/loli/', loliRoutes)

// Export default
module.exports = router
