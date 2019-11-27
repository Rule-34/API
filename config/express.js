const express = require('express'),
  // Requirements
  config = require('./config'),
  // Plugins
  logger = require('morgan'),
  helmet = require('helmet'),
  cors = require('cors'),
  compress = require('compression'),
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
  .use(compress())
  .use(cors())
  // Error handling
  .use(errorHandler.errorHandler)

// Development plugins
if (config.env === 'development') {
  //TODO: see if it works
  app.use(logger('dev'))
}

// Import all Routes
app.use(indexerRouter)

// Export
module.exports = app
