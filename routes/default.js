const express = require('express'),
  generalConfig = require('../config/generalConfig'),
  router = express.Router()

/* GET home page. */
router.get('/', function(req, res) {
  res.json({
    message:
      'This is an API wrapper made for https://r34.app, it gathers content from the next sites',
    rule34_xxx: {
      domain: 'https://rule34.xxx/',
      api: generalConfig.host + 'xxx/',
    },

    rule34_paheal_net: {
      domain: 'https://rule34.paheal.net/',
      api: generalConfig.host + 'paheal/',
    },

    danbooru_donmai_us: {
      domain: 'https://danbooru.donmai.us/',
      api: generalConfig.host + 'danbooru/',
    },

    lolibooru_moe: {
      domain: 'https://lolibooru.moe/',
      api: generalConfig.host + 'loli/',
    },
  })
})

module.exports = router
