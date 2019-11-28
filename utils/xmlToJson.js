const { transform } = require('camaro'),
  postTemplate = {
    count: '/posts/@count',
  },
  countTemplate = {
    posts: [
      '/posts/post',

      {
        file_url: '/posts/post/@file_url',
        sample_url: '/posts/post/@sample_url',
        tags: ['/posts/post/@tags'],
        source: '/posts/post/@source',
        type: '/posts/post/@type',
      },
    ],
  }

// Transforms the passed xml into json and returns it
async function xmlToJson(operation, xml) {
  let result = ''
  // console.log('XML DATA IS', xml)

  switch (operation) {
    case 'count':
      result = await transform(xml, countTemplate)
      break

    case 'posts':
      result = await transform(xml, postTemplate)
      break
  }

  // console.log(result)
  return result
}

module.exports = xmlToJson
