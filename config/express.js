// Requirements
const express = require('express'),
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

// Security and default plugins
app
  .set('port', generalConfig.port)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true })) // TODO: See what it does
  .use(compression({ threshold: 0 }))
  .use(
    cors({
      methods: ['GET'],
      allowedHeaders: ['Content-Type'],
    })
  )
  .use(helmet())
  .disable('x-powered-by') // Remove powered by

  // Cosmetic plugins
  .use(favicon(__dirname + '/../static/favicon.ico'))

if (generalConfig.env === 'development') {
  // Log everything and show full errors
  app.use(logger('dev')).use(errorHandler())
} else {
  // Log errors only and use cache
  app
    .use(
      logger('dev', {
        skip: function(req, res) {
          return res.statusCode < 400
        },
      })
    )
    .use(cache('3 minutes'))
    // Cache performance
    .get('/cache/performance', (req, res) => {
      res.json(apicache.getPerformance())
    })
    // Cache index
    .get('/cache/index', (req, res) => {
      res.json(apicache.getIndex())
    })
}

// Import all Routes
app.use(indexerRouter)

// Export
module.exports = app
