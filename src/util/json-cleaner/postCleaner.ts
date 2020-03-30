// @ts-nocheck
/* eslint-disable @typescript-eslint/camelcase */

import { stringToArray, isVideo } from '@/util/shared'

// Definitions
import { PassedData } from '@/types/passed-data'

import Debug from 'debug'
const debug = Debug(`Server:util post Cleaner`)

/**
 *
 * @param {Object} json Json Object which contains post content
 * @param {String} domain Domain for specific quirk treatment
 */
export default ({ data, domain, corsProxyUrl }: PassedData): Array<object> => {
  const finalJson: Array<object> = []

  let iterableJson: Array<object> = []

  // Error handling
  if (!data) {
    throw new Error('No data to parse')
  }

  // Parse JSON
  switch (domain) {
    // Data was converted from XML to JSON
    case 'xxx':
    case 'paheal':
    case 'gelbooru':
    case 'safebooru':
      iterableJson = data[0]
      break

    // Simple parse
    case 'danbooru':
    case 'loli':
      iterableJson = JSON.parse(data)
      break

    // Encapsulate on array
    case 'danbooru-single':
      iterableJson = [JSON.parse(data)]
      break

    // Simple parse and acess .posts
    case 'e621':
      iterableJson = JSON.parse(data).posts
      break

    case 'e621-single':
      iterableJson = [JSON.parse(data).post]
      break

    // Exit with error as a domain is needed
    default:
      throw 'No domain supplied, a domain is needed'
  }

  // Loop each post to extract only the things that we are gonna use
  iterableJson.forEach((post) => {
    const tempJson = {}

    // Add ID
    tempJson.id = post.id

    // Proxy media files and skip to next if they have any media assigned
    switch (domain) {
      case 'xxx':
        if (!post.high_res_file) {
          debug(`Empty media: Skipping execution of ${tempJson.id}`)
          return
        }

        tempJson.high_res_file =
          corsProxyUrl + post.high_res_file.replace('xxx/', 'xxx//')

        tempJson.low_res_file =
          corsProxyUrl + post.low_res_file.replace('xxx/', 'xxx//')

        tempJson.preview_file =
          corsProxyUrl + post.preview_file.replace('xxx/', 'xxx//')

        break

      case 'paheal':
        if (!post.high_res_file) {
          debug(`Empty media: Skipping execution of ${tempJson.id}`)
          return
        }

        tempJson.high_res_file = corsProxyUrl + post.high_res_file

        // We skip low_res_file as it doesnt exist on paheal

        // TODO: THIS MIGHT BECAUSE OF THE XML TO JSON TRANSFORMATION

        tempJson.preview_file = corsProxyUrl + post.preview_file

        break

      case 'danbooru':
      case 'danbooru-single':
        if (!post.file_url) {
          debug(`Empty media: Skipping execution of ${tempJson.id}`)
          return
        }

        tempJson.high_res_file = corsProxyUrl + post.file_url

        tempJson.low_res_file = corsProxyUrl + post.large_file_url // Yes, for some reason 'large_file_url' is actually the low resolution one, blame danbooru

        tempJson.preview_file = corsProxyUrl + post.preview_file_url

        break

      // Similar to XXX but without replacing
      case 'gelbooru':
      case 'safebooru':
        if (!post.high_res_file) {
          debug(`Empty media: Skipping execution of ${tempJson.id}`)
          return
        }

        tempJson.high_res_file = corsProxyUrl + post.high_res_file

        tempJson.low_res_file = corsProxyUrl + post.low_res_file

        tempJson.preview_file = corsProxyUrl + post.preview_file

        break

      // Close to danbooru but low_res_file is different
      case 'e621':
      case 'e621-single':
        if (!post.file.url) {
          debug(`Empty media: Skipping execution of ${tempJson.id}`)
          return
        }

        tempJson.high_res_file = corsProxyUrl + post.file.url

        tempJson.low_res_file = corsProxyUrl + post.sample.url

        tempJson.preview_file = corsProxyUrl + post.preview.url

        break

      case 'loli':
        if (!post.file_url) {
          debug(`Empty media: Skipping execution of ${tempJson.id}`)
          return
        }

        tempJson.high_res_file = corsProxyUrl + post.file_url

        tempJson.low_res_file = corsProxyUrl + post.sample_url

        tempJson.preview_file = corsProxyUrl + post.preview_url

        break
    }

    // Add tags
    switch (domain) {
      // Concatenate every array inside
      case 'e621':
      case 'e621-single':
        tempJson.tags = []

        Object.values(post.tags).forEach((tagContainer) => {
          tempJson.tags = tempJson.tags.concat(tagContainer)
        })
        break

      case 'danbooru-single':
      case 'danbooru':
        tempJson.tags = stringToArray(post.tag_string)
        break

      default:
        tempJson.tags = stringToArray(post.tags)
        break
    }

    // Add source
    switch (domain) {
      case 'e621':
      case 'e621-single':
        tempJson.source = post.sources[0]
        break

      default:
        tempJson.source = post.source
        break
    }

    // Add rating
    switch (post.rating) {
      case 'e':
        tempJson.rating = 'explicit'
        break

      case 'q':
        tempJson.rating = 'questionable'
        break

      case 's':
        tempJson.rating = 'safe'
        break

      default:
        // debug(post.rating)
        tempJson.rating = undefined
        break
    }

    // Add type
    if (isVideo(tempJson.high_res_file)) {
      tempJson.type = 'video'
    } else {
      tempJson.type = 'image'
    }

    // Push it to the real json
    finalJson.push(tempJson)
  })

  // And return it to the main function
  return finalJson
}
