import { Request, Response } from 'express'

// Util
import { BooruHandler } from '@/util/booru/custom'

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
  const jsonResult: object = await BooruHandler('posts', queryObj)

  // Reply
  res.json(jsonResult)
}
