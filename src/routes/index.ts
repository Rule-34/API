import { Router, Request, Response } from 'express'

import {
  postsValidation,
  singlePostValidation,
  tagsValidation,
  queryValidate,
} from '../middleware/query-validation'
import booru from './booru'

export default Router()
  // Middleware
  .use(['*/posts', '*/random-post'], postsValidation(), queryValidate)
  .use('*/single-post', singlePostValidation(), queryValidate)
  .use('*/tags', tagsValidation(), queryValidate)

  // Static routes
  .get(`/`, function (_req: Request, res: Response) {
    res.json({ status: 'UP' })
  })

  // Sub routers
  .use(`/booru`, booru)
