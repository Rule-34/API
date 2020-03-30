import { Request, Response } from 'express'

// Configuration
import domainData from './domainData'

// Util
import fetchAndTransform from '@/util/fetchAndTransform'

// Init
import Debug from 'debug'
const debug = Debug(`Server:route e621 posts`)

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
module.exports = async (req: Request, res: Response): Promise<void> => {
  // Get the requested parameters and create a url to request data with it
  const requestUrl: string = applyUrlParameters(req)
  debug(requestUrl)

  // Process through wich the xml request gets transformed to optimized json
  const jsonResult: object = await fetchAndTransform({
    url: requestUrl,
    template: 'posts',
    domain: 'e621',
    isJson: true,
    useCorsProxy: req.query.corsProxy,
  })

  // Reply
  res.json(jsonResult)
}
