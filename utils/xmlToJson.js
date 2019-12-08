const { transform } = require('camaro'),
  // This is a basic template for the r34.app
  // If you need more data you should add it here or create another template
  xxxTemplate = {
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
  },
  pahealTemplate = {
    count: 'number(/posts/@count)',
    posts: [
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

/* case 'loli': // This is for tags
  return await transform(xml, xxxTemplate) */

// If its a tag template
/* case 'tags':
      return await transform(xml, tagTemplate) */

// Using 0 as a workaround since camaro doesnt like to use arrays
// At this moment it is not used, but could be useful for the future
/* tagTemplate = {
    0: [
      '/tags/tag',
      {
        name: '@name',
        posts: 'number(@count)',
      },
    ],
  } */
