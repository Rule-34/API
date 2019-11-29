const { transform } = require('camaro'),
  // This is a basic template for the r34.app
  // If you need more data you should add it here or create another template
  template = {
    count: 'number(/posts/@count)',
    posts: [
      '/posts/post',
      {
        id: 'number(@id)',
        high_res_file: '@file_url',
        low_res_file: '@sample_url',
        preview_file: '@preview_url',
        tags: '@tags',
        source: '@source',
        type: '',
      },
    ],
  }

// Transforms the passed xml into json and returns it
async function xmlToJson(xml) {
  return await transform(xml, template)
}

module.exports = xmlToJson
