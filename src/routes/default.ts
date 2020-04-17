/* eslint-disable @typescript-eslint/camelcase */
import { Request, Response } from 'express'

import constants from '@/configuration'
const host = constants.host

/**
 * GET /
 * Home page.
 */
module.exports = (req: Request, res: Response): void => {
  res.json({
    message:
      'This is an API wrapper made for https://r34.app, it gathers content from the next sites',
    rule34_xxx: {
      domain: 'https://rule34.xxx/',
      api: `${host}/xxx/`,
    },

    rule34_paheal: {
      domain: 'https://rule34.paheal.net/',
      api: `${host}/paheal/`,
    },

    danbooru: {
      domain: 'https://danbooru.donmai.us/',
      api: `${host}/danbooru/`,
    },

    gelbooru: {
      domain: 'https://gelbooru.com/',
      api: `${host}/gelbooru/`,
    },

    e621: {
      domain: 'https://e621.net/',
      api: `${host}/e621/`,
    },

    lolibooru: {
      domain: 'https://lolibooru.moe/',
      api: `${host}/loli/`,
    },
  })
}
