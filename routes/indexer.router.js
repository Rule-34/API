const express = require('express'),
  router = express.Router(),
  // Import all routes // TODO: use glob to match *.route files
  defaultRouter = require('./default')

/*
 ** All routes are used from here
 */
router
  // Error debugger
  /* .get('*', function(req, res, next) {
    // Reporting async errors *must* go through `next()`
    setImmediate(() => {
      next(new Error('woops'))
    })
  }) */
  /* GET /health-check - Check service health */
  .get('/health-check', (req, res) => res.send('OK'))
  .use('/', defaultRouter)

// Export default
module.exports = router
