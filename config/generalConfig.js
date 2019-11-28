// Defines defaults if they are available from ENV
const generalConfig = {
  env: process.env.NODE_ENV || 'production',
  host: process.env.HOST || 'http://localhost/',
  port: process.env.PORT || 8000,
  workers = process.env.WEB_CONCURRENCY || 1,
}

module.exports = generalConfig
