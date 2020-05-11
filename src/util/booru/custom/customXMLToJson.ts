/* eslint-disable @typescript-eslint/camelcase */
import { transform } from 'camaro'

const template = {
  0: [
    '/posts/post',
    {
      id: 'number(@id)',
      score: 'number(@score)',

      high_res_file: { url: '@file_url', height: '@height', width: '@width' },

      low_res_file: {
        url: '@sample_url',
        height: '@sample_height',
        width: '@sample_width',
      },

      preview_file: {
        url: '@preview_url',
        height: '@preview_height',
        width: '@preview_width',
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
export default async (xml: string): Promise<object> => {
  return await transform(xml, template)
}
