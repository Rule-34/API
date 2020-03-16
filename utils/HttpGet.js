const fetch = require('node-fetch')
// debug = require('debug')(`HTTP GET`)

// Gets the content from the passed url and returns it
async function httpsGet(url) {
  const data = await fetch(url, {
    headers: {
      'User-Agent':
        'Rule 34 API (https://github.com/VoidlessSeven7/Rule-34-API)'
    }
  })
    .then((res) => {
      // Check for HTTP status errors
      if (!res.ok) {
        throw new Error('Fetch: Network response was not ok')
      }

      return res.text()
    })
    .catch((error) => {
      throw new Error(`Fetch: ${error}`)
    })

  // debug(data)

  return data
}

module.exports = httpsGet
