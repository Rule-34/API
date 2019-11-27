var express = require('express')
var router = express.Router()

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({
    message:
      'This is an API wrapper made for https://r34.app, it gathers content from the next sites:',
    rule34_xxx: 'https://rule34.xxx/',
    rule34_paheal_net: 'https://rule34.paheal.net/',
    lolibooru_moe: 'https://lolibooru.moe/'
  })
})

module.exports = router
