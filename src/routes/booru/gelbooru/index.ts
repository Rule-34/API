/* eslint-disable @typescript-eslint/no-var-requires */
import { Router } from 'express'
import asyncHandler from 'express-async-handler'

import domainData from './domainData'

import { randomMiddlewareWithAPI, defaultResponse } from '@/middleware/booru'

const router = Router()

/*
 ** Routes
 */
router
  .get('/', defaultResponse(domainData))

  .get('/posts', asyncHandler(require('./posts')))
  .get('/single-post', asyncHandler(require('./singlePost')))

  .get(
    '/random-post',
    randomMiddlewareWithAPI,
    asyncHandler(require('./posts'))
  )

  .get('/tags', asyncHandler(require('./tags')))

// Export default
module.exports = router
