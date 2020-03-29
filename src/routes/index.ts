/* eslint-disable @typescript-eslint/no-var-requires */
import { Router } from 'express'
import fs from 'fs'

// Create router
const router = Router()

// Add static routes
router.use('/', require('./default'))

// Add dynamic routes
fs.readdirSync(__dirname + '/booru', { withFileTypes: true })
  .filter((dir) => dir.isDirectory())
  .map((dir) => router.use(`/${dir.name}`, require(`./booru/${dir.name}`)))

export default router
