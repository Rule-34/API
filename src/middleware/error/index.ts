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

  try {
    message = JSON.parse(err.message)
    debug('Parsed error message')
  } catch (error) {
    debug('Couldnt parse error message, must be a normal error')
  }

  res.status(status).json({
    error: {
      code: err.status,
      message,
      error: process.env.NODE_ENV === 'development' ? err : {},
    },
  })
}
