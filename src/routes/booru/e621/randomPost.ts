import { Request, Response, NextFunction } from 'express'

/**
 * Middleware
 */
module.exports = (req: Request, res: Response, next: NextFunction): void => {
  // Modify order to be random
  req.query.order = 'random'

  next()
}
