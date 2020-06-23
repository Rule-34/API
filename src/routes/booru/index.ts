import { Router, Request, Response } from 'express'
import asyncHandler from 'express-async-handler'

// Util
import { BooruHandler } from '../../util/booru/BooruHandler'

const router = Router()

/*
 ** Routes
 */
router.get(
  '/:booruType/:endpoint',
  asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const queryObj = req.query
      // debug(req.params.booruType)
      // debug(req.params.endpoint)

      const JSONResult = await BooruHandler(
        { booruType: req.params.booruType, endpoint: req.params.endpoint },
        queryObj
      )

      res.json(JSONResult)
    }
  )
)

module.exports = router
