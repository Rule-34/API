import { transform } from 'camaro'

import { EmptyDataError } from '@/util/classes'

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
  let JSONData

  switch (mode) {
    case 'posts':
      JSONData = await transform(xml, postsTemplate)
      break

    case 'tags':
      JSONData = await transform(xml, tagsTemplate)
      break

    default:
      throw new Error('No mode specified')
  }

  if (!JSONData || !JSONData.xml || !JSONData.xml.length)
    throw new EmptyDataError()

  // Just return the Array, no object needed
  return JSONData.xml
}
