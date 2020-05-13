/* eslint-disable @typescript-eslint/no-var-requires */
import { Router, Request, Response } from 'express'
import asyncHandler from 'express-async-handler'

// Util
import { BooruHandler } from '@/util/booru/BooruHandler'

const router = Router()

/*
 ** Routes
 */
router
  // .get('/', defaultResponse(domainData))

  .get(
    '/:booruType/:endpoint',
    asyncHandler(
      async (req: Request, res: Response): Promise<void> => {
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
    )
  )

// Export default
module.exports = router
