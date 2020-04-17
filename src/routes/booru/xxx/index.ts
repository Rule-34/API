/* eslint-disable @typescript-eslint/no-var-requires */
import { Router } from 'express'
import asyncHandler from 'express-async-handler'

import domainData from './domainData'

import { randomMiddlewareWithoutAPI } from '@/middleware/booru'

const router = Router()

/*
 ** Routes
 */
router
  .get('/', require('./default'))

  .get('/posts', asyncHandler(require('./posts')))
  .get('/single-post', asyncHandler(require('./singlePost')))

  .get(
    '/random-post',
    randomMiddlewareWithoutAPI(domainData),
    asyncHandler(require('./singlePost'))
  )

  .get('/tags', asyncHandler(require('./tags')))

// Export default
module.exports = router
