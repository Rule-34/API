const generalConfig = require('./config/generalConfig'),
  configPackage = require('./package.json'),
  debug = require('debug')(configPackage.name),
  app = require('./config/express')

// Initialize server
const server = app.listen(app.get('port'), function() {
  debug(
    `Express server listening on port ${server.address().port} in mode ${
      generalConfig.env
    } in host ${server.address().address}`
  )
})

module.exports = app
