const express = require('express'),
  router = express.Router(),
  // Import all routes // TODO: use glob to match *.route files
  defaultRouter = require('./default')

/*
 ** All routes are used from here
 */
router
  /* GET /health-check - Check service health */
  .get('/health-check', (req, res) => res.send('OK'))
  .use('/', defaultRouter)

// Export default
module.exports = router
