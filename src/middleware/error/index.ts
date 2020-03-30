import { Request, Response, NextFunction } from 'express'
import Debug from 'debug'

import ErrorObj from '@/types/error-obj.interface'

// Init
const debug = Debug(`Server:middleware error handler`)

export default (
  err: ErrorObj,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  debug(err.stack)

  res.status(err.status || 500)

  let message: string | object = err.message

  try {
    message = JSON.parse(err.message)

    debug('Parsed error message')
  } catch (error) {
    debug('Couldnt parse error message, must be a normal error')
  }

  res.json({
    errors: {
      message,
      error: process.env.NODE_ENV === 'development' ? err : {},
    },
  })
}
