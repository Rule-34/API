import { Request, Response, NextFunction } from 'express'

import domainData from './domainData'

import booruList from 'ext/r34-shared/booru-list.json'

// Init
// import Debug from 'debug'
// const debug = Debug(`Server:route randomPost`)

/**
 * Middleware
 */
module.exports = (req: Request, res: Response, next: NextFunction): void => {
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
