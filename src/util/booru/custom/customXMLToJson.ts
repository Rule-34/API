import { ready, transform } from 'camaro'

const postsTemplate = {
  xml: [
    '/posts/post',
    {
      id: 'number(@id)',
      score: 'number(@score)',

      high_res_file: {
        url: '@file_url',
        width: 'number(@width)',
        height: 'number(@height)',
      },

      low_res_file: {
        url: '@sample_url',
        width: 'number(@sample_width)',
        height: 'number(@sample_height)',
      },

      preview_file: {
        url: '@preview_url',
        width: 'number(@preview_width)',
        height: 'number(@preview_height)',
      },

      tags: '@tags',
      source: '@source',
      rating: '@rating',
    },
  ],
}

const tagsTemplate = {
  xml: [
    '/tags/tag',
    {
      name: '@name',
      count: 'number(@count)',
    },
  ],
}

/**
 * Transforms XML to Json using a template
 * @xml XML data
 */
export default async (xml: string, mode: string): Promise<string> => {
  // Ready camaro
  await ready()

  switch (mode) {
    case 'posts':
      return await transform(xml, postsTemplate)

    case 'tags':
      return await transform(xml, tagsTemplate)

    default:
      throw new Error('No mode specified')
  }
}
