/* eslint-disable @typescript-eslint/camelcase */
import { ready, transform } from 'camaro'

const template = {
  0: [
    '/posts/post',
    {
      id: 'number(@id)',
      score: 'number(@score)',
      high_res_file: '@file_url',
      low_res_file: '@sample_url',
      preview_file: '@preview_url',
      tags: '@tags',
      source: '@source',
      rating: '@rating',
      type: '',
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

  return JSON.stringify(await transform(xml, template))
}
