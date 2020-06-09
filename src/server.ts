import dotenv from 'dotenv'
dotenv.config()

import app from './app'

/**
 * Start Express server
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
