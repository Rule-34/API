import { Request, Response } from 'express'
import domainData from './domainData'

import constants from '@/configuration/constants'
const DOMAIN = constants.DOMAIN

module.exports = (req: Request, res: Response): void => {
  res.json({
    message: `This endpoint is for ${domainData.url}`,

    posts: `${DOMAIN}/${domainData.short}posts`,

    'single-post': `${DOMAIN}/${domainData.short}single-post`,

    tags: `${DOMAIN}/${domainData.short}tags`,
  })
}
