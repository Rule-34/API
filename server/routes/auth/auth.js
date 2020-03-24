const express = require('express'),
  fetch = require('node-fetch'),
  // Requirements
  generalConfig = require('@server/config/generalConfig.js'),
  // Init
  router = express.Router(),
  debug = require('debug')(`Patreon auth`)

// Use the same redirect url that the client used (this is just a mirror)
const INITIAL_REDIRECT_URL =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:8000/oauth/redirect'
      : 'https://rule-34-api.herokuapp.com/oauth/redirect',
  // Real URL to redirect to
  REDIRECT_URL =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/auth'
      : 'https://r34.app/auth'

router.get('/', async function (req, res, next) {
  // Define variables
  const codeToken = req.query.code,
    url = `https://www.patreon.com/api/oauth2/token?code=${codeToken}&grant_type=authorization_code&client_id=${generalConfig.patreon_client_id}&client_secret=${generalConfig.patreon_client_secret}&redirect_uri=${INITIAL_REDIRECT_URL}`

  // debug(url)

  // Fetch token of the user
  const data = await fetch(url, {
    method: 'POST',
    headers: {
      accept: 'application/x-www-form-urlencoded',
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

  // Exit if theres no data
  if (!data.access_token) return next(new Error('No data fetched'))

  // debug(data)

  // Redirect user to the app with data in the query
  res.redirect(
    `${REDIRECT_URL}?access_token=${data.access_token}&refresh_token=${data.refresh_token}&expires_in=${data.expires_in}`
  )
})

module.exports = router
