// Definitions
import { BooruResponses } from '@/types/types'

// Init
// import Debug from 'debug'
// const debug = Debug(`Server:util Post Cleaner`)

export function createPostFromData(
  booruType: string,
  fetchedPostData: BooruResponses.PostRequest
): BooruResponses.PostResponse {
  const tmpJSON: BooruResponses.PostResponse = {
    id: undefined,
    score: undefined,
    high_res_file: {
      url: undefined,
      height: undefined,
      width: undefined,
    },
    low_res_file: {
      url: undefined,
      height: undefined,
      width: undefined,
    },
    preview_file: {
      url: undefined,
      height: undefined,
      width: undefined,
    },
    tags: undefined,
    source: undefined,
    rating: undefined,
    type: undefined,
  }

  /*
   * ID
   */
  tmpJSON.id = fetchedPostData.id

  /*
   * Score
   */
  switch (booruType) {
    case 'danbooru2':
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore // Disabled because I dont know how I could do this
      if (typeof fetchedPostData.score.total === 'number') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore // Disabled because I dont know how I could do this
        tmpJSON.score = fetchedPostData.score.total
        break
      }
      tmpJSON.score = fetchedPostData.score as number
      break

    default:
      tmpJSON.score = fetchedPostData.score as number
      break
  }

  /*
   * File URLs
   */

  switch (booruType) {
    case 'danbooru2':
      // E621
      if (fetchedPostData.file) {
        tmpJSON.high_res_file = {
          url: fetchedPostData.file.url,
          width: fetchedPostData.file.width,
          height: fetchedPostData.file.height,
        }

        tmpJSON.low_res_file = {
          url: fetchedPostData.sample.url,
          width: fetchedPostData.sample.width,
          height: fetchedPostData.sample.height,
        }

        tmpJSON.preview_file = {
          url: fetchedPostData.preview.url,
          width: fetchedPostData.preview.width,
          height: fetchedPostData.preview.height,
        }

        break
      }

      // Most danbooru2 types
      tmpJSON.high_res_file = {
        url: fetchedPostData.file_url,
        width: fetchedPostData.image_width,
        height: fetchedPostData.image_height,
      }

      tmpJSON.low_res_file = {
        url: fetchedPostData.large_file_url,
      }

      tmpJSON.preview_file = {
        url: fetchedPostData.preview_file_url,
      }
      break

    default:
      tmpJSON.high_res_file = fetchedPostData.high_res_file
      tmpJSON.low_res_file = fetchedPostData.low_res_file
      tmpJSON.preview_file = fetchedPostData.preview_file
      break
  }

  // Fix for rule34.xxx
  tmpJSON.high_res_file.url = tmpJSON.high_res_file.url.replace('xxx/', 'xxx//')
  tmpJSON.low_res_file.url = tmpJSON.low_res_file.url.replace('xxx/', 'xxx//')
  tmpJSON.preview_file.url = tmpJSON.preview_file.url.replace('xxx/', 'xxx//')

  // Delete empty "" urls
  if (tmpJSON.high_res_file.url === '') tmpJSON.high_res_file.url = null
  if (tmpJSON.low_res_file.url === '') tmpJSON.low_res_file.url = null
  if (tmpJSON.preview_file.url === '') tmpJSON.preview_file.url = null

  /*
   * Tags
   */
  switch (booruType) {
    case 'danbooru2':
      if (fetchedPostData.tag_string) {
        tmpJSON.tags = fetchedPostData.tag_string?.trim().split(' ')
        break
      }

      tmpJSON.tags = []

      Object.keys(fetchedPostData.tags).forEach((tagContainer) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        tmpJSON.tags = tmpJSON.tags.concat(fetchedPostData.tags[tagContainer])
      })
      break

    default:
      tmpJSON.tags = (fetchedPostData.tags as string)?.trim().split(' ')
      break
  }

  /*
   * Source
   */

  switch (booruType) {
    case 'danbooru2':
      if (fetchedPostData.sources) {
        tmpJSON.source = fetchedPostData.sources
        break
      }

      tmpJSON.source = [fetchedPostData.source]
      break

    default:
      tmpJSON.source = [fetchedPostData.source]
      break
  }

  // Remove empty "" sources
  tmpJSON.source.forEach((source, index) => {
    if (source === '') tmpJSON.source.splice(index)
  })

  /*
   * Rating
   */
  switch (fetchedPostData.rating) {
    case 'e':
      tmpJSON.rating = 'explicit'
      break

    case 'q':
    case 'suggestive': // Derpibooru
      tmpJSON.rating = 'questionable'
      break

    case 's':
      tmpJSON.rating = 'safe'
      break

    case 'u':
      tmpJSON.rating = 'unrated'
      break

    default:
      tmpJSON.rating = 'unknown'
      break
  }

  /*
   * Media type
   */
  tmpJSON.type = /\.(webm|mp4|ogg)$/.test(tmpJSON.high_res_file.url)
    ? 'video'
    : 'image'

  return tmpJSON
}
