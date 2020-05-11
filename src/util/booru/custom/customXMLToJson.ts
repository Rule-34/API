import { ready, transform } from 'camaro'

const template = {
  xml: [
    '/posts/post',
    {
      id: 'number(@id)',
      score: 'number(@score)',

      high_res_file: {
        url: '@file_url',
        height: 'number(@height)',
        width: 'number(@width)',
      },

      low_res_file: {
        url: '@sample_url',
        height: 'number(@sample_height)',
        width: 'number(@sample_width)',
      },

      preview_file: {
        url: '@preview_url',
        height: 'number(@preview_height)',
        width: 'number(@preview_width)',
      },

      tags: '@tags',
      source: '@source',
      rating: '@rating',
    },
  ],
}

/**
 * Transforms XML to Json using a template
 * @xml XML data
 */
export default async (xml: string): Promise<string> => {
  // Ready camaro
  await ready()

  return await transform(xml, template)
}
