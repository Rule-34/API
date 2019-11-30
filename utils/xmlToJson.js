const { transform } = require('camaro'),
  // This is a basic template for the r34.app
  // If you need more data you should add it here or create another template
  postsTemplate = {
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
  tagsTemplate = {
    tags: ['/tags/tag', { name: '@name', count: 'number(@count)' }],
  }

// Transforms the passed xml into json and returns it
async function xmlToJson(xml, template) {
  // Applies the template that its specified
  switch (template) {
    case 'posts':
      return await transform(xml, postsTemplate)

    case 'tags':
      return await transform(xml, tagsTemplate)
  }
}

module.exports = xmlToJson
