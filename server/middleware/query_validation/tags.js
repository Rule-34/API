const { query } = require('express-validator')
//   debug = require('debug')(`Posts Template`)

const tagsValidation = () => {
  return [
    query('tag').isString().notEmpty(),
    query('limit').isInt().optional(),
    query('order').isString().optional(),
    query('pid').isInt().optional(),
  ]
}

module.exports = {
  tagsValidation,
}
