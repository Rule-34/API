import dotenv from 'dotenv'
dotenv.config()

import 'module-alias/register'

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
