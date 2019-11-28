const https = require('https')

// Gets the content from the passed url and returns it
async function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, res => {
        //   console.log('statusCode:', res.statusCode)
        //   console.log('headers:', res.headers)
        let urlData = ''

        res
          .on('data', d => {
            //   process.stdout.write(d)
            urlData += d.toString()
          })
          .on('end', () => {
            // console.log('URL DATA IS ', urlData)
            resolve(urlData)
          })
      })
      .on('error', e => {
        //   console.error(e)
        reject(e)
      })
  })
}

module.exports = httpsGet
