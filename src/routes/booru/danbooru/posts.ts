import { Router, Request, Response } from 'express'
import debug from 'debug'

// Configuration
import domainData from './domainData'

// Util
import { xmlToJsonFromUrl } from '@/util/xmlToJsonFromUrl'

// Init
const router = Router()
debug(`Server:route danbooru posts`)

/**
 * Helper function for building an URL
 * @param req Request for extracting queries
 */
function applyUrlParameters(req: Request): string {
  // Default query parameters
  const limit: number = req.query.limit || 20,
    pageId: number = req.query.pid,
    tags: string = req.query.tags || '',
    rating: string = req.query.rating,
    score: number = req.query.score

  let builtUrl: string = domainData.postsApi + '?limit=' + limit

  if (pageId) {
    builtUrl += '&page=' + pageId
  }

  // Always add tags in case score is added
  builtUrl += '&tags=' + tags

  if (rating) {
    // Test if it starts with a minus
    const prefix = rating.startsWith('-') ? '-' : '+'

    builtUrl += prefix + 'rating:' + rating.substring(1)
  }

  if (score) {
    builtUrl += '+score:>=' + score
  }

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
  const jsonResult: object = await xmlToJsonFromUrl({
    url: requestUrl,
    template: 'posts',
    domain: 'danbooru',
    isJson: true,
    useCorsProxy: req.query.corsProxy,
  })

  // Reply
  res.json(jsonResult)
})

module.exports = router
