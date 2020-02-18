const { transform } = require('camaro'),
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
  let result

  switch (domain) {
    case 'xxx':
    case 'gelbooru':
      result = await transform(xml, xxxTemplate)
      return result

    case 'paheal':
      result = await transform(xml, pahealTemplate)
      return result
  }
}

module.exports = xmlToJson
