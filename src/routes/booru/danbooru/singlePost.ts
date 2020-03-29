import { Router, Request, Response } from 'express'
import debug from 'debug'

// Configuration
import domainData from './domainData'

// Util
import fetchAndTransform from '@/util/fetchAndTransform'

// Init
const router = Router()
debug(`Server:route danbooru single-post`)

/**
 * Helper function for building an URL
 * @param req Request for extracting queries
 */
function applyUrlParameters(req: Request): string {
  // Default query parameters
  const { postId }: { postId: number } = req.query

  const builtUrl: string = domainData.singlePostApi + postId + '.json'

  return builtUrl
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
    template: 'posts',
    domain: 'danbooru-single',
    isJson: true,
    useCorsProxy: req.query.corsProxy,
  })

  // Reply
  res.json(jsonResult)
})

module.exports = router
