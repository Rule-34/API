// Defines defaults if they are available from ENV
const config = {
  env: process.env.NODE_ENV || 'production',
  host: process.env.HOST || 'http://localhost/',
  port: process.env.PORT || 8008,
}

module.exports = config
