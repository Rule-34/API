const httpGet = require('../utils/HttpGet.js'),
  xmlToJson = require('../utils/xmlToJson.js'),
  finalJson = {
    count: '',
    posts: [],
  }

async function xmlToJsonFromUrl(url) {
  // console.log(url)
  // First get XML from url
  const xmlData = await httpGet(url)
  // console.log('XML DATA IS', xmlData)

  // Then save count
  finalJson.count = await xmlToJson('count', xmlData)

  // Loop to save every post to the final json object
  let posts = xmlData.getElementsByTagName('post')

  for (let i = 0; i < posts.length; i++) {
    let post = posts[i]
    console.log(post)

    // Transform xml posts to json
    finalJson.posts[i] = await xmlToJson('posts', post)
  }

  // console.log('JSON DATA IS', jsonData)

  return finalJson
}

module.exports = xmlToJsonFromUrl
