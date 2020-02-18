const express = require('express'),
  router = express.Router(),
  defaultRouter = require('./default.js'),
  postsRouter = require('./posts.js'),
  singlePostRouter = require('./singlePost.js'),
  tagsRouter = require('./tags.js')

/*
 ** All routes are used here
 */
router
  .use('/', defaultRouter)
  .use('/posts', postsRouter)
  .use('/single-post', singlePostRouter)

  .use('/tags', tagsRouter)

// Export default
module.exports = router
