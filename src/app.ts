import express from 'express'
// Utils
import bodyParser from 'body-parser'
import compression from 'compression'
import morgan from 'morgan'
// Security
import cors from 'cors'
import helmet from 'helmet'
// Errors
import errorHandler from './middleware/error'
// Routes
import baseRouter from './routes'

// Create Express server
const app = express()

// Express configuration
app.set('trust proxy', 1)
app.set('port', process.env.PORT || 8100)

// Express middleware
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

  case 'production':
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

/**
 * Routes
 */
app.use(baseRouter)

//  Error handler
app.use(errorHandler)

export default app
