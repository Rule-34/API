// Definitions
import { Booru } from '@/types/types'

// Init
// import Debug from 'debug'
// const debug = Debug(`Server:util Post Cleaner`)

export function createPostFromData(
  booruType: string,
  fetchedPostData: Booru.Structures.Data.Raw.Post
): Booru.Structures.Data.Processed.Post {
  const Post: Booru.Structures.Data.Processed.Post = {
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
    tags: [],
    source: [],
    rating: undefined,
    type: undefined,
  }

  /*
   * ID
   */
  Post.id = fetchedPostData.id

  /*
   * Score
   */
  switch (booruType) {
    case 'danbooru2':
      if (
        typeof (fetchedPostData.score as { total: number }).total === 'number'
      ) {
        Post.score = (fetchedPostData.score as { total: number }).total
        break
      }
      Post.score = fetchedPostData.score as number
      break

    default:
      Post.score = fetchedPostData.score as number
      break
  }

  /*
   * File URLs
   */

  switch (booruType) {
    case 'danbooru2':
      // E621
      if (fetchedPostData.file) {
        Post.high_res_file = {
          url: fetchedPostData.file.url,
          width: fetchedPostData.file.width,
          height: fetchedPostData.file.height,
        }

        Post.low_res_file = {
          url: fetchedPostData.sample.url,
          width: fetchedPostData.sample.width,
          height: fetchedPostData.sample.height,
        }

        Post.preview_file = {
          url: fetchedPostData.preview.url,
          width: fetchedPostData.preview.width,
          height: fetchedPostData.preview.height,
        }

        break
      }

      // Most danbooru2 types
      Post.high_res_file = {
        url: fetchedPostData.file_url,
        width: fetchedPostData.image_width,
        height: fetchedPostData.image_height,
      }

      Post.low_res_file = {
        url: fetchedPostData.large_file_url,
      }

      Post.preview_file = {
        url: fetchedPostData.preview_file_url,
      }
      break

    default:
      Post.high_res_file = fetchedPostData.high_res_file
      Post.low_res_file = fetchedPostData.low_res_file
      Post.preview_file = fetchedPostData.preview_file
      break
  }

  // Delete empty "" urls
  if (Post.high_res_file.url === '') Post.high_res_file.url = null
  if (Post.low_res_file.url === '') Post.low_res_file.url = null
  if (Post.preview_file.url === '') Post.preview_file.url = null

  // Fix for rule34.xxx
  if (RegExp('xxx/').test(Post.high_res_file.url)) {
    Post.high_res_file.url = Post.high_res_file.url.replace('xxx/', 'xxx//')
    Post.low_res_file.url = Post.low_res_file.url.replace('xxx/', 'xxx//')
    Post.preview_file.url = Post.preview_file.url.replace('xxx/', 'xxx//')
  }

  /*
   * Tags
   */
  switch (booruType) {
    case 'danbooru2':
      if (fetchedPostData.tag_string) {
        Post.tags = fetchedPostData.tag_string?.trim().split(' ')
        break
      }

      Object.keys(fetchedPostData.tags).forEach((tagContainer) => {
        Post.tags = Post.tags.concat(tagContainer)
      })
      break

    default:
      Post.tags = (fetchedPostData.tags as string)?.trim().split(' ')
      break
  }

  // Remove duplicates
  Post.tags = [...new Set(Post.tags)]

  /*
   * Source
   */

  switch (booruType) {
    case 'danbooru2':
      if (fetchedPostData.sources) {
        Post.source = fetchedPostData.sources
        break
      }

      Post.source = [fetchedPostData.source]
      break

    default:
      Post.source = [fetchedPostData.source]
      break
  }

  // Remove empty "" sources
  Post.source.forEach((source, index) => {
    if (source === '') Post.source.splice(index)
  })

  /*
   * Rating
   */
  switch (fetchedPostData.rating) {
    case 'e':
      Post.rating = 'explicit'
      break

    case 'q':
    case 'suggestive': // Derpibooru
      Post.rating = 'questionable'
      break

    case 's':
      Post.rating = 'safe'
      break

    case 'u':
      Post.rating = 'unrated'
      break

    default:
      Post.rating = 'unknown'
      break
  }

  /*
   * Media type
   */
  Post.type = /\.(webm|mp4|ogg)$/.test(Post.high_res_file.url)
    ? 'video'
    : 'image'

  return Post
}
