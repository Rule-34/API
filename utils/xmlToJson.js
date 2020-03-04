const { transform } = require('camaro'),
  template = {
    0: [
      '/posts/post',
      {
        id: 'number(@id)',
        high_res_file: '@file_url',
        low_res_file: '@sample_url',
        preview_file: '@preview_url',
        tags: '@tags',
        rating: '@rating',
        source: '@source',
        type: '',
      },
    ],
  }

// Transforms the passed xml into json and returns it
async function xmlToJson(xml) {
  let result

  result = await transform(xml, template)
  return result
}

module.exports = xmlToJson
