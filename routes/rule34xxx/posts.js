const express = require('express'),
  router = express.Router(),
  xmlToJsonFromUrl = require('../../utils/xmlToJsonFromUrl.js')

const url = 'https://rule34.xxx/index.php?page=dapi&s=post&q=index'

/* GET home page. */
router.get('/', async (req, res) => {
  // Process through wich the xml request gets transformed to json
  let result = await xmlToJsonFromUrl(url)
  // console.dir(result)

  res.json(result)
})

module.exports = router
