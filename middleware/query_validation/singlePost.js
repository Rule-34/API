const { query } = require('express-validator')
//   debug = require('debug')(`Posts Template`)

const singlePostValidation = () => {
  return [
    query('id').isInt(),
    query('corsProxy')
      .isBoolean()
      .toBoolean()
      .optional()
  ]
}

module.exports = {
  singlePostValidation
}
