const express = require('express'),
  fetch = require('node-fetch'),
  // Init
  router = express.Router(),
  debug = require('debug')(`Patreon Token`)

router.get('/', async function (req, res, next) {
  // Define variables
  const { access_token, refresh_token } = req.query,
    url =
      'https://www.patreon.com/api/oauth2/v2/identity?fields%5Buser%5D=full_name,image_url'

  // Fetch token of the user
  const data = await fetch(url, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })
    .then((response) => {
      // Check for HTTP status errors
      if (!response.ok) {
        next(new Error('Fetch: Network response was not ok'))
        return
      }

      return response.json()
    })
    .catch((error) => {
      next(error)
      return
    })

  // debug(data)

  res.json(data)
})

module.exports = router
