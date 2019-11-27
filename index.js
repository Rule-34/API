const config = require('./config/config'),
  app = require('./config/express')

app.listen(config.port, () => {
  console.info(`server started on port ${config.port} (${config.env})`) // eslint-disable-line no-console
})

module.exports = app
