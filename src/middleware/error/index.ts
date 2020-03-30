import { Request, Response, NextFunction } from 'express'
import Debug from 'debug'

import IErrorWithStatus from '@/types/error-with-status.interface'

// Init
const debug = Debug(`Server:middleware error handler`)

export default (
  err: IErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  debug(err.stack)

  res.status(err.status || 500)

  const message: string = err.message

  res.json({
    errors: {
      message,
      error: process.env.NODE_ENV === 'development' ? err : {},
    },
  })
}
