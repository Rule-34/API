const express = require('express'),
  router = express.Router(),
  defaultRouter = require('./default.js'),
  postsRouter = require('./posts.js'),
  tagsRouter = require('./tags.js')

/*
 ** All routes are used here
 */
router
  .use('/', defaultRouter)
  .use('/posts', postsRouter)

  .use('/tags', tagsRouter)

// Export default
module.exports = router
