const fetch = require('node-fetch')
// debug = require('debug')(`HTTP GET`)

fetch('https://postman-echo.com/get', {
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; rv:68.0) Gecko/20100101 Firefox/68.0',
  },
})
  .then(res => res.text())
  .then(body => console.log(body))
