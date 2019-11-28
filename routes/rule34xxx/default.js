const express = require('express'),
  generalConfig = require('../../config/generalConfig'),
  domainConfig = require('./domainConfig'),
  router = express.Router()

/* GET home page. */
router.get('/', function(req, res) {
  res.json({
    message: 'This API is for the ' + domainConfig.url + ' domain',
    posts: generalConfig.host + domainConfig.routeUrl + 'posts',
    comments: generalConfig.host + domainConfig.routeUrl + 'comments',
    tags: generalConfig.host + domainConfig.routeUrl + 'tags',
    images: generalConfig.host + domainConfig.routeUrl + 'images',
  })
})

module.exports = router
