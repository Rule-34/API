const express = require('express'),
  // Requirements
  config = require('./config'),
  // Plugins
  logger = require('morgan'),
  helmet = require('helmet'),
  cors = require('cors'),
  compression = require('compression'),
  bodyParser = require('body-parser'),
  // Routes
  indexerRouter = require('../routes/indexer.router'),
  // Init
  app = express(),
  // Handlers
  errorHandler = require('./errorHandler')

// Assigning plugins
app
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true })) // TODO: See what it does
  .use(helmet())
  .use(compression())
  .use(cors())
  // Error handling
  .use(errorHandler.errorHandler)

// If in development log everything, otherwise only log errors
if (config.env === 'development') {
  app.use(logger('dev'))
} else {
  app.use(
    logger('dev', {
      skip: function(req, res) {
        return res.statusCode < 400
      }
    })
  )
}

// Import all Routes
app.use(indexerRouter)

// Export
module.exports = app
