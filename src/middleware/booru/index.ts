import { Request, Response, NextFunction } from 'express'

// Init
// import Debug from 'debug'
// const debug = Debug(`Server:route randomPost`)

export function randomMiddlewareWithoutAPI() {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Generate random post ID
    const randomPostID = Math.floor(Math.random() * Math.floor(3000))

    // Save for next route
    req.query.id = (randomPostID as unknown) as string

    next()
  }
}

export const randomMiddlewareWithAPI = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Modify order to be random
  req.query.order = 'random'

  // Default to 1 as the limit
  req.query.limit = req.query.limit ?? ((1 as unknown) as string)

  next()
}
