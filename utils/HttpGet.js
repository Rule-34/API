const fetch = require('node-fetch')
// debug = require('debug')(`HTTP GET`)

// Gets the content from the passed url and returns it
async function httpsGet(url) {
  try {
    const data = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; rv:68.0) Gecko/20100101 Firefox/68.0',
      },
    })
    const response = await data.text()
    return response

    // Error handling
  } catch (error) {
    throw Error(error)
  }
}

module.exports = httpsGet
