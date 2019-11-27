const express = require('express'),
  https = require('https'),
  router = express.Router()

const url = 'https://rule34.xxx/index.php?page=dapi&s=post&q=index'

/* GET home page. */
router.get('/', async (req, res, next) {
  // Make http request
  https
    .request(url, function(response) {
      response.pipe(res)
    })
    .on('error', function(e) {
      res.sendStatus(500)
      res.json({ error: e })
    })
    .end()
})


const template = {
  post: ///psot
}




module.exports = router
