// Defines defaults if they are available from ENV
const generalConfig = {
  env: process.env.NODE_ENV || 'production',
  debug: process.env.DEBUG || undefined, // This is just a dummy constant so you know you have to set a DEBUG env for debug messages to show
  host: process.env.HOST || 'http://localhost:8000/',
  port: process.env.PORT || 8000,
  workers: process.env.WEB_CONCURRENCY || 1,
}

module.exports = generalConfig
