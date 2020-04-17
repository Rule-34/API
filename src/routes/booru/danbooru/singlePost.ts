import { Request, Response } from 'express'

// Configuration
import domainData from './domainData'

// Util
import fetchAndTransform from '@/util/booru/fetchAndTransform'

// Init
// import Debug from 'debug'
// const debug = Debug(`Server:route danbooru single-post`)

/**
 * Helper function for building an URL
 * @param req Request for extracting queries
 */
function applyUrlParameters(req: Request): string {
  // Default query parameters
  const postId = req.query.id

  const builtUrl: string = domainData.singlePostApi + postId + '.json'

  return builtUrl
}

/**
 * Route
 */
module.exports = async (req: Request, res: Response): Promise<void> => {
  // Get the requested parameters and create a url to request data with it
  const requestUrl: string = applyUrlParameters(req)
  // debug(requestUrl)

  // Process through wich the xml request gets transformed to optimized json
  const jsonResult: object = await fetchAndTransform({
    url: requestUrl,
    template: 'posts',
    domain: 'danbooru-single',
    isJson: true,

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore // Disabled because its already a boolean by the express-validator middleware
    useCorsProxy: req.query.corsProxy,
  })

  // Reply
  res.json(jsonResult)
}
