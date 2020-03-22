const express = require('express'),
  generalConfig = require('@server/config/generalConfig.js'),
  router = express.Router()

/* GET home page. */
router.get('/', function (req, res) {
  res.json({
    message:
      'This is an API wrapper made for https://r34.app, it gathers content from the next sites',
    rule34_xxx: {
      domain: 'https://rule34.xxx/',
      api: generalConfig.host + 'xxx/',
    },

    rule34_paheal: {
      domain: 'https://rule34.paheal.net/',
      api: generalConfig.host + 'paheal/',
    },

    danbooru: {
      domain: 'https://danbooru.donmai.us/',
      api: generalConfig.host + 'danbooru/',
    },

    gelbooru: {
      domain: 'https://gelbooru.com/',
      api: generalConfig.host + 'gelbooru/',
    },

    e621: {
      domain: 'https://e621.net/',
      api: generalConfig.host + 'e621/',
    },

    lolibooru: {
      domain: 'https://lolibooru.moe/',
      api: generalConfig.host + 'loli/',
    },
  })
})

module.exports = router
