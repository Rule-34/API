import { Router, Request, Response } from 'express'
import debug from 'debug'

// Configuration
import domainData from './domainData'

// Util
import fetchAndTransform from '@/util/fetchAndTransform'

// Init
const router = Router()
debug(`Server:route danbooru tags`)

/**
 * Helper function for building an URL
 * @param req Request for extracting queries
 */
function applyUrlParameters(req: Request): string {
  // Default query parameters
  const tag: string = req.query.tag,
    limit: number = req.query.limit || 25,
    pageId: number = req.query.pid || 1,
    order: string = req.query.order || 'count'

  return (
    domainData.tagsApi +
    '?search[name_matches]=' +
    tag +
    '*' +
    '&limit=' +
    limit +
    '&page=' +
    pageId +
    '&search[order]=' +
    order
  )
}

/**
 * Route
 */
router.get('/', async function (req: Request, res: Response) {
  // Get the requested parameters and create a url to request data with it
  const requestUrl: string = applyUrlParameters(req)
  debug(requestUrl)

  // Process through wich the xml request gets transformed to optimized json
  const jsonResult: object = await fetchAndTransform({
    url: requestUrl,
    template: 'tags',
    domain: 'danbooru',
    isJson: true,
  })

  // Reply
  res.json(jsonResult)
})

module.exports = router
