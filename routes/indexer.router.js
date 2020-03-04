const express = require('express'),
  router = express.Router(),
  // Import all routes // TODO: use glob to match *.route files
  defaultRouter = require('./default'),
  // proxyRouter = require('./proxy'), DEPRECATED because we're using a Cloudflare worker to do this
  xxxRoutes = require('./xxx/index.routes.js'),
  pahealRoutes = require('./paheal/index.routes.js'),
  danbooruRoutes = require('./danbooru/index.routes.js'),
  gelbooruRoutes = require('./gelbooru/index.routes.js'),
  loliRoutes = require('./loli/index.routes.js'),
  e621Routes = require('./e621/index.routes.js')

// All routes are added here
router
  /* GET /health-check - Check service health */
  // .get('/health-check', (req, res) => res.send('OK'))

  // Default screen
  .use('/', defaultRouter)

  // Booru routes
  .use('/xxx/', xxxRoutes)
  .use('/paheal/', pahealRoutes)
  .use('/danbooru/', danbooruRoutes)
  .use('/gelbooru/', gelbooruRoutes)
  .use('/loli/', loliRoutes)
  .use('/e621/', e621Routes)

// Export default
module.exports = router
