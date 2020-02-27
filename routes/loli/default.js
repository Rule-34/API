const express = require('express'),
  generalConfig = require('../../config/generalConfig'),
  domainConfig = require('./domainConfig'),
  router = express.Router()

/* GET home page. */
router.get('/', function(req, res) {
  res.json({
    message: 'This API is for the ' + domainConfig.baseUrl + ' domain',
    posts: generalConfig.host + domainConfig.routeUrl + 'posts',
    'single-post': generalConfig.host + domainConfig.routeUrl + 'single-post',
    tags: generalConfig.host + domainConfig.routeUrl + 'tags',
  })
})

module.exports = router
