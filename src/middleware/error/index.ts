import { Request, Response, NextFunction } from 'express'
import Debug from 'debug'

import { GenericAPIError } from '../../util/error'
import { isDevEnv } from 'src/util/environment'

const debug = Debug(`Server:middleware Error Handler`)

export default (
  err: Error | GenericAPIError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const { message, stack, messageArray, status = 500 } = err as GenericAPIError

  if (status >= 400) {
    debug(stack)
  }

  res.status(status).json({
    error: {
      code: status,
      message,
      errors: messageArray,

      stack: isDevEnv ? stack : undefined,
    },
  })
}
