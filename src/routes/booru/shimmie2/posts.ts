import { Request, Response } from 'express'

// Util
import { BooruHandler } from '@/util/booru/BooruHandler'

/**
 * Route
 */
module.exports = async (req: Request, res: Response): Promise<void> => {
  const queryObj = req.query
  // debug(requestUrl)

  const jsonResult: object = await BooruHandler(
    { booruType: 'shimmie2', endpoint: 'posts' },
    queryObj
  )

  // Reply
  res.json(jsonResult)
}
