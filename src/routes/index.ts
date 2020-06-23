/* eslint-disable @typescript-eslint/no-var-requires */
import { Router, Request, Response } from 'express'

const router = Router()

/**
 * Middleware
 */
import {
  postsValidation,
  singlePostValidation,
  tagsValidation,
  queryValidate,
} from '../middleware/query-validation'

router
  .use(['*/posts', '*/random-post'], postsValidation(), queryValidate)
  .use('*/single-post', singlePostValidation(), queryValidate)
  .use('*/tags', tagsValidation(), queryValidate)

/**
 * Static routes
 */
router.get(`/`, function (req: Request, res: Response) {
  res.json({ status: 'UP' })
})

router.use(`/booru`, require(`./booru`))

export default router
