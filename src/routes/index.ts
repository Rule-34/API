/* eslint-disable @typescript-eslint/no-var-requires */
import { Router } from 'express'
import fs from 'fs'

const router = Router()

/**
 * Middleware
 */
import {
  postsValidation,
  singlePostValidation,
  tagsValidation,
  queryValidate,
} from '@/middleware/query-validation'

router
  .use(['*/posts', '*/random-post'], postsValidation(), queryValidate)
  .use('*/single-post', singlePostValidation(), queryValidate)
  .use('*/tags', tagsValidation(), queryValidate)

/**
 * Static routes
 */

/**
 * Dynamic routes
 */
router.use(`/booru`, require(`./booru`))

export default router
