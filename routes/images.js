const express = require('express'),
  https = require('https'),
  router = express.Router()

/* Act as a proxy with cors for images */
router.get('/', function(req, res) {
  // There needs to be a url for a image
  if (!req.query.url) {
    res.sendStatus(404)
  }

  // Get the requested url image and respond with it
  const request = https.get(req.query.url, response => {
    res.setHeader('Content-Type', response.headers['content-type'])
    res.setHeader('Cache-Control', 'max-age=31557600') // Thanks to @KuroZenZen for this code
    response.pipe(res)
  })

  request.on('error', function(e) {
    res.json({ error: e })
    console.error(e)
  })
})

module.exports = router
