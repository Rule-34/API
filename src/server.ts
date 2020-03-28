import app from './app'

/**
 * Error Handler. Provides full stack - remove for production
 */

/**
 * Start Express server.
 */
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
