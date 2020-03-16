const generalConfig = require('../config/generalConfig'),
  debug = require('debug')(`Error Handler`)

module.exports = function errorHandler(err, req, res, next) {
  debug(err.stack)

  res.status(err.status || 500)

  res.json({
    errors: {
      message: err.message,
      error: generalConfig.env === 'development' ? err : {}
    }
  })
}
