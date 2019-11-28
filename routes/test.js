const express = require('express'),
  router = express.Router(),
  xmlToJsonFromUrl = require('../utils/xmlToJsonFromUrl.js')

const url = 'https://rule34.xxx/index.php?page=dapi&s=post&q=index'

/* GET home page. */
router.get('/', async (req, res, next) => {
  // Process through wich the xml request gets transformed to json
  res.json(await xmlToJsonFromUrl(url))
})

module.exports = router
