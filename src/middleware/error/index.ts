import { Request, Response, NextFunction } from 'express'

import { CustomError } from '@/util/classes'

// Init
import Debug from 'debug'
const debug = Debug(`Server:middleware error handler`)

export default (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Extract values from err
  const { status = 500, stack } = err

  debug(stack)

  let message: string | object = err.message

  // If message is an Array of messages
  if (err.messageArray) {
    message = err.messageArray
  }

  res.status(status).json({
    error: {
      code: err.status,
      message,
      // Only send stack if we are in development
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  })
}
