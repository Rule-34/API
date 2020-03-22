const express = require('express'),
  // Init
  router = express.Router()

/* GET posts. */
router.get('/', async function(req, res, next) {
  return res
    .status(410)
    .json({ Error: "This site doesn't allow to search for single posts" })
})

module.exports = router
