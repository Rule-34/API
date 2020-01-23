const fetch = require('node-fetch')
// debug = require('debug')(`HTTP GET`)

// Gets the content from the passed url and returns it
async function httpsGet(url) {
  try {
    const data = await fetch(url)
    const response = await data.text()
    return response

    // Error handling
  } catch (error) {
    throw Error(error)
  }
}

module.exports = httpsGet
