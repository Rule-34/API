const xml2js = require('xml2js')

// Transforms the passed xml into json and returns it
function xmlToJson(xml) {
  // console.log('XML DATA IS', xml)
  return new Promise(function(resolve, reject) {
    // With parser
    const parser = new xml2js.Parser(/* options */)
    parser
      .parseStringPromise(xml, { trim: true, explicitRoot: false })
      .then(function(result) {
        // console.dir(result)
        resolve(result)
      })
      .catch(function(err) {
        // Failed
        reject(err)
      })
  })
}

module.exports = xmlToJson
