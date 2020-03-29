import { Request, Response } from 'express'
import domainData from './domainData'

module.exports = (req: Request, res: Response): void => {
  res.json({
    message: `This endpoint is for the ${domainData.url} booru`,

    posts: `//${domainData.short}posts`,
    'single-post': `//${domainData.short}single-post`,
    tags: `//${domainData.short}tags`,
  })
}
