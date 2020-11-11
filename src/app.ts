import express from 'express'
import * as Sentry from '@sentry/node'
import bodyParser from 'body-parser'
import compression from 'compression'
import morgan from 'morgan'
import cors from 'cors'
import helmet from 'helmet'

import errorHandler from './middleware/errorHandler'
import baseRouter from './routes'
import { isDevEnv, isProdEnv } from './util/environment'

// Construct the express app
const app = express()

// Enable Sentry Error Analytics in production
if (isProdEnv) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    ignoreErrors: ['No data received', 'FetchError'],
  })
  app.use(Sentry.Handlers.requestHandler() as express.RequestHandler)
}

// Express configuration
app.set('trust proxy', 1)
app.set('port', process.env.PORT || 8100)

// Middleware
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(compression({ threshold: 0 }))
app.use(helmet())

// Cors
app.use(
  cors({
    // Allow all origins in development
    origin: isDevEnv ? '*' : 'https://r34.app',
    methods: ['GET'],
  })
)

// Logging
app.use(
  // Skip everything but errors in production
  isDevEnv
    ? morgan('dev')
    : morgan('dev', {
        skip: function (_req, res) {
          return res.statusCode < 400
        },
      })
)

// Routes
app.use(baseRouter)

// Sentry Error Analytics
if (isProdEnv) {
  app.use(Sentry.Handlers.errorHandler() as express.ErrorRequestHandler)
}

//  Error handler
app.use(errorHandler)

export default app
