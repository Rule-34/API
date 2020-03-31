import dotenv from 'dotenv'
dotenv.config()

import 'module-alias/register'

// Analytics
if (process.env.NODE_ENV === 'production') {
  require('newrelic')
}

import app from './app'

/**
 * Error Handler. Provides full stack - remove for production
 */

/**
 * Start Express server.
 */

// console.log('Estamos en ' + process.env.NODE_ENV)

const server = app.listen(app.get('port'), () => {
  console.log(
    `
Express server
Running on http://localhost:${app.get('port')}
In ${app.get('env')} mode
`
  )
})

export default server
