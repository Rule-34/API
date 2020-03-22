require('dotenv').config()

// Defines defaults if they are available from ENV
const generalConfig = {
  env: process.env.NODE_ENV || 'production',

  // This is just a dummy constant so you know you have to set a DEBUG env for debug messages to show
  debug: process.env.DEBUG || undefined,

  // Server configuration
  host: process.env.HOST || 'http://localhost:8000/',
  port: process.env.PORT || 8000,
  workers: process.env.WEB_CONCURRENCY || 1,

  // Patreon
  patreon_client_id: process.env.PATREON_CLIENT_ID,
  patreon_client_secret: process.env.PATREON_CLIENT_SECRET,
}

module.exports = generalConfig
