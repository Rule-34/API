import { Request, Response, NextFunction } from 'express'

import { DomainData } from 'booru.interface'

import booruList from 'ext/r34-shared/booru-list.json'

// Init
// import Debug from 'debug'
// const debug = Debug(`Server:route randomPost`)

export function randomMiddlewareWithoutAPI(domainData: DomainData) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Get short from domain data
    const booruShort = domainData['short'].slice(0, -1)

    // Use short as an identifier to get max_count
    const maxCount = booruList.find((booru) => booru.short === booruShort)[
      'max_count'
    ]

    // Generate random post ID
    const randomPostID = Math.floor(Math.random() * Math.floor(maxCount))

    // Save for next route
    req.query.id = (randomPostID as unknown) as string

    // debug(randomPostID, booruShort, maxCount)

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
