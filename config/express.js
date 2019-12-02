const express = require('express'),
  // Requirements
  generalConfig = require('./generalConfig'),
  // Plugins
  bodyParser = require('body-parser'),
  compression = require('compression'),
  cors = require('cors'),
  logger = require('morgan'),
  helmet = require('helmet'),
  apicache = require('apicache'),
  errorHandler = require('errorhandler'),
  favicon = require('serve-favicon'),
  // Routes
  indexerRouter = require('../routes/indexer.router'),
  // Init
  app = express(),
  cache = apicache.middleware
// Handlers

// Assigning plugins
app
  .set('port', generalConfig.port)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(compression())
  .use(cors())
  .use(helmet())

  .use(favicon(__dirname + '/../static/favicon.ico'))

// If in development log everything, otherwise only log errors and use cache
if (generalConfig.env === 'development') {
  app
    .use(logger('dev'))
    // Error handling
    .use(errorHandler())
} else {
  app
    .use(
      logger('dev', {
        skip: function(req, res) {
          return res.statusCode < 400
        },
      })
    )
    .use(cache('3 minutes'))
}

// Import all Routes
app.use(indexerRouter)

// Export
module.exports = app
