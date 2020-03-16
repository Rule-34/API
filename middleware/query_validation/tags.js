const { query } = require('express-validator')
//   debug = require('debug')(`Posts Template`)

const tagsValidation = () => {
  return [
    query('tag')
      .isString()
      .notEmpty(),
    query('limit')
      .isInt()
      .optional()
  ]
}

module.exports = {
  tagsValidation
}
