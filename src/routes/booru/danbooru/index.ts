/* eslint-disable @typescript-eslint/no-var-requires */
import { Router } from 'express'

const router = Router()

/*
 ** All routes are used here
 */
router
  .get('/', require('./default'))

  .get('/posts', require('./posts'))
  .get('/single-post', require('./singlePost'))

  .get('/tags', require('./tags'))

// .get('/test', (req, res) => {
//   res.send('lol')
// })

// Export default
module.exports = router
