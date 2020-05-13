import { Request, Response } from 'express'

// Util
import { BooruHandler } from '@/util/booru/BooruHandler'

/**
 * Route
 */
module.exports = async (req: Request, res: Response): Promise<void> => {
  const queryObj = req.query
  // debug(requestUrl)
  // debug(req.params.booruType)
  // debug(req.params.endpoint)

  const jsonResult: object = await BooruHandler(
    { booruType: req.params.booruType, endpoint: req.params.endpoint },
    queryObj
  )

  // Reply
  res.json(jsonResult)
}
