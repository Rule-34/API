/* eslint-disable @typescript-eslint/no-var-requires */
import { Router } from 'express'

const router = Router()

/*
 ** All routes are used here
 */
router.use('/', require('./default'))

//   .use('/posts', require('./posts'))
//   .use('/single-post', require('./singlePost'))

//   .use('/tags', require('./tags'))

// Export default
module.exports = router
