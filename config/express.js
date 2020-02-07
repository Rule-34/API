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
  .use(helmet())
  .disable('x-powered-by') // Remove powered by

  // Cosmetic plugins
  .use(favicon(__dirname + '/../static/favicon.ico'))

if (generalConfig.env === 'development') {
  app
    // Log everything and show full errors
    .use(logger('dev'))
    .use(errorHandler())

    // Allow all origins
    .use(
      cors({
        methods: ['GET'],
        allowedHeaders: ['Content-Type'],
      })
    )
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

    // Allow only access from my app
    // EDIT: For some reason it does not return a 'Access-Control-Origin' header when its not from this site, otherwise it perfectly works
    .use(
      cors({
        origin: /r34\.app$/, // Only allow use from the Rule34 App
        methods: ['GET'],
        allowedHeaders: ['Content-Type'],
      })
    )

    // Use a memory based cache
    .use(cache('3 minutes'))

    .get('/cache/performance', (req, res) => {
      res.json(apicache.getPerformance())
    })

    .get('/cache/index', (req, res) => {
      res.json(apicache.getIndex())
    })
}

// Import all Routes
app.use(indexerRouter)

// Export
module.exports = app
