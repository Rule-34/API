const express = require('express'),
  config = require('../../config/config'),
  domainConfig = require('./domainConfig'),
  router = express.Router()

/* GET home page. */
router.get('/', function(req, res) {
  res.json({
    message: 'This API is for the ' + domainConfig.url + ' domain',
    posts: config.host + domainConfig.routeUrl + 'posts',
    comments: config.host + domainConfig.routeUrl + 'comments',
    tags: config.host + domainConfig.routeUrl + 'tags',
    images: config.host + domainConfig.routeUrl + 'images',
  })
})

module.exports = router
