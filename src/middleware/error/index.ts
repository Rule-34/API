import { Request, Response, NextFunction } from 'express'

import IErrorWithStatus from '@/types/error-with-status.interface'

// Init
import Debug from 'debug'
const debug = Debug(`Server:middleware error handler`)

export default (
  err: IErrorWithStatus,
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
