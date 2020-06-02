import { Request, Response, NextFunction } from 'express'

import { GenericAPIError } from '@/util/classes'

// Init
import Debug from 'debug'
const debug = Debug(`Server:middleware Error Handler`)

export default (
  err: GenericAPIError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Extract values from err
  const { messageArray, status, stack } = err

  debug(stack)

  res.status(status).json({
    error: {
      code: status,
      errors: messageArray,

      // Only send stack if we are in development
      stack: process.env.NODE_ENV === 'development' ? stack : undefined,
    },
  })
}
