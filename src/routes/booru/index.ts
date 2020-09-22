import { Router, Request, Response } from 'express'
import asyncHandler from 'express-async-handler'

import { BooruHandler } from '../../util/booru/BooruHandler'

export default Router()
  // Routes
  .get(
    '/:booruType/:endpoint',
    asyncHandler(
      async (req: Request, res: Response): Promise<void> => {
        const queryObj = req.query

        const JSONResult = await BooruHandler(
          { booruType: req.params.booruType, endpoint: req.params.endpoint },
          queryObj
        )

        res.json(JSONResult)
      }
    )
  )
