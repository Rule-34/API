import { Request, Response } from 'express'

// Configuration
import domainData from './domainData'

// Util
import customFetchAndTransform from '@/util/booru/custom'

// Init
// import Debug from 'debug'
// const debug = Debug(`Server:route Shimmie posts`)

/**
 * Route
 */
module.exports = async (req: Request, res: Response): Promise<void> => {
  const queryObj = req.query
  // debug(requestUrl)

  // Process through wich the xml request gets transformed to optimized json
  const jsonResult: object = await customFetchAndTransform({
    queryObj,
    desiredEndpoint: 'posts',
  })

  // Reply
  res.json(jsonResult)
}
