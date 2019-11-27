const config = require('./config/config'),
  configPackage = require('./package.json'),
  debug = require('debug')(configPackage.name),
  app = require('./config/express')

// Initialize server
const server = app.listen(app.get('port'), function() {
  debug(
    `Express server listening on port ${server.address().port} in mode ${
      config.env
    } in host ${server.address().address}`
  )
})

module.exports = app
