const https = require('https')

// Gets the content from the passed url and returns it
async function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, res => {
        let urlData = ''

        res
          .on('data', d => {
            //   process.stdout.write(d)
            urlData += d.toString()
          })
          .on('end', () => {
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
