const { transform } = require('camaro'),
  // This is a basic template for the r34.app
  // If you need more data you should add it here or create another template
  xxxTemplate = {
    0: [
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
  },
  pahealTemplate = {
    0: [
      '/posts/post',
      {
        id: 'number(@id)',
        high_res_file: '@file_url',
        preview_file: '@preview_url',
        tags: '@tags',
        source: '@source',
        type: '',
      },
    ],
  }

// Transforms the passed xml into json and returns it
async function xmlToJson(xml, domain) {
  switch (domain) {
    case 'xxx':
      return await transform(xml, xxxTemplate)

    case 'paheal':
      return await transform(xml, pahealTemplate)
  }
}

module.exports = xmlToJson
