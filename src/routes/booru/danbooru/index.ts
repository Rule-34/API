/* eslint-disable @typescript-eslint/no-var-requires */
import { Router } from 'express'
import asyncHandler from 'express-async-handler'

import {
  postsValidation,
  singlePostValidation,
  tagsValidation,
  queryValidate,
} from '@/middleware/query-validation'

const router = Router()

/**
 * Middleware
 */
router
  .use('*/posts', postsValidation(), queryValidate)
  .use('*/single-post', singlePostValidation(), queryValidate)
  .use('*/tags', tagsValidation(), queryValidate)

/*
 ** All routes are used here
 */
router
  .get('/', require('./default'))

  .get('/posts', asyncHandler(require('./posts')))
  .get('/single-post', asyncHandler(require('./singlePost')))

  .get('/tags', asyncHandler(require('./tags')))

// .get('/test', (req, res) => {
//   res.send('lol')
// })

// Export default
module.exports = router
