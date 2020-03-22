require('module-alias/register')

// Heroku Concurrency
const throng = require('throng'),
  // Requirements
  generalConfig = require('@server/config/generalConfig.js')

// Use cluster (more node services executing this) if in production
if (generalConfig.env === 'production') {
  throng(
    {
      workers: generalConfig.workers,
      lifetime: Infinity,
    },
    start
  )
} else {
  start('Master')
}

// Express server runned by workers
function start(workerId) {
  const debug = require('debug')(`HTTP Worker ${workerId}`),
    app = require('@server/config/express.js')

  // If server is turned off
  process.on('SIGTERM', () => {
    debug(`Worker ${workerId} exiting...`)
    process.exit()
  })

  // Initialize server
  const server = app.listen(generalConfig.port, function () {
    debug(
      `
      Express server
      Listening on port ${server.address().port}
      In ${generalConfig.env} mode
      On host ${server.address().address}
      `
    )
  })
}
