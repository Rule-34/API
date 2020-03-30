import express, { Request, Response } from 'express'
// Utils
import bodyParser from 'body-parser'
import compression from 'compression'
import morgan from 'morgan'
// Security
import cors from 'cors'
import helmet from 'helmet'
import apicache from 'apicache'
import rateLimit from 'express-rate-limit'
// Errors
import errorHandler from './middleware/error'
// Routes
import baseRouter from './routes'

// Create Express server
const app = express()

// Create cache middleware
const cache = apicache.middleware

// Create Rate limiter middleware
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 225, // 15 requests per minute
})

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

    // Cache
    app.use(cache('5 minutes'))

    app.get('/cache/performance', (req: Request, res: Response) => {
      res.json(apicache.getPerformance())
    })

    app.get('/cache/index', (req: Request, res: Response) => {
      res.json(apicache.getIndex())
    })

    // Rate limit
    app.use(rateLimiter)
    break
}

//  Error handler
app.use(errorHandler)

/**
 * Routes
 */
app.use(baseRouter)

export default app
