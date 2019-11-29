const express = require('express'),
  router = express.Router(),
  defaultRouter = require('./default.js'),
  postsRouter = require('./posts.js')
// ,commentsRouter = require('./comments.js'),
// tagsRouter = require('./tags.js')
// imagesRouter = require('./images.js')

/*
 ** All routes are used here
 */
router.use('/', defaultRouter).use('/posts', postsRouter)
// .use('/comments', commentsRouter)
// .use('/tags', tagsRouter)
// .use('/images', imagesRouter)

// Export default
module.exports = router
