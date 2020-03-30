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
  .use('*/posts', postsValidation(), queryValidate)
  .use('*/single-post', singlePostValidation(), queryValidate)
  .use('*/tags', tagsValidation(), queryValidate)

/**
 * Static routes
 */
router.get('/', require('./default'))

if (process.env.NODE_ENV === 'development') {
  router.get('/test', require('./test'))
}

/**
 * Dynamic routes
 */
fs.readdirSync(__dirname + '/booru', { withFileTypes: true })
  .filter((dir) => dir.isDirectory())
  .map((dir) => {
    // console.log('Direction ' + dir.name)
    router.use(`/${dir.name}`, require(`./booru/${dir.name}`))
  })

export default router
