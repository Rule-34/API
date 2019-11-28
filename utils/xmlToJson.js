const { transform } = require('camaro'),
  template = {
    count: '/posts/@count',
    posts: [
      '/posts/post',
      [
        {
          file_url: '@file_url',
          sample_url: '@sample_url',
          tags: ['@tags'],
          source: '@source',
          type: '@type',
        },
      ],
    ],
  }

// Transforms the passed xml into json and returns it
async function xmlToJson(xml) {
  // console.log('XML DATA IS', xml)

  const result = await transform(xml, template)
  console.log(result)
  return result
}

module.exports = xmlToJson
