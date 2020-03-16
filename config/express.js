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
  rateLimit = require('express-rate-limit'),
  errorHandler = require('errorhandler'),
  // Routes
  indexerRouter = require('../routes/indexer.router'),
  // Init
  app = express(),
  cache = apicache.middleware,
  rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 225 // 15 requests per minute
  })

app
  // Because of Heroku
  .set('trust proxy', 1)

if (generalConfig.env === 'development') {
  app
    // Allow all origins
    .use(
      cors({
        origin: '*',
        methods: ['GET'],
        allowedHeaders: ['Content-Type']
      })
    )
    // Log everything
    .use(logger('dev'))
} else {
  app
    // Only allow use from the Rule34 App
    .use(
      cors({
        origin: 'https://r34.app',
        methods: ['GET'],
        allowedHeaders: ['Content-Type']
      })
    )
    // Only log errors
    .use(
      logger('dev', {
        skip: function(req, res) {
          return res.statusCode < 400
        }
      })
    )
}

// Common config
app
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())

  // Compression and security
  .use(compression({ threshold: 0 }))
  .use(helmet())

  // Cosmetic plugins
  .disable('x-powered-by')

if (generalConfig.env !== 'development') {
  // Use a memory based cache
  app
    .use(cache('5 minutes'))

    .get('/cache/performance', (req, res) => {
      res.json(apicache.getPerformance())
    })

    .get('/cache/index', (req, res) => {
      res.json(apicache.getIndex())
    })

    // Rate limit
    .use(rateLimiter)
}

// Import all Routes
app
  .use(indexerRouter)

  // Use error handler
  .use(errorHandler)

// Export
module.exports = app
