/* eslint-disable @typescript-eslint/no-var-requires */
import { Router } from 'express'
import fs from 'fs'

const router = Router()

router.use('/', require('./default'))

// Dynamic routes
// fs.readdirSync(__dirname + '/booru', { withFileTypes: true })
//   .filter((dir) => dir.isDirectory())
//   .map((dir) => router.use(`/${dir.name}`, require(`./${dir.name}`)))

export default router
