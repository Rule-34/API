import express from 'express'
import * as Sentry from '@sentry/node'

// Middleware
import bodyParser from 'body-parser'
import compression from 'compression'
import morgan from 'morgan'
import cors from 'cors'
import helmet from 'helmet'

// Own middleware
import errorHandler from './middleware/error'

// Routes
import baseRouter from './routes'

const app = express()

// Sentry Error Analytics
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    ignoreErrors: ['No data received'],
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

// Middleware for development
switch (process.env.NODE_ENV) {
  case 'development':
    // CORS
    app.use(
      cors({
        origin: '*',
        methods: ['GET'],
      })
    )

    // Logging
    app.use(morgan('dev'))
    break

  default:
    // CORS
    app.use(
      cors({
        origin: 'https://r34.app',
        methods: ['GET'],
      })
    )

    // Logging
    app.use(
      morgan('dev', {
        skip: function (req, res) {
          return res.statusCode < 400
        },
      })
    )

    break
}

// Routes
app.use(baseRouter)

// Sentry Error Analytics
if (process.env.NODE_ENV === 'production')
  app.use(Sentry.Handlers.errorHandler() as express.ErrorRequestHandler)

//  Error handler
app.use(errorHandler)

export default app
