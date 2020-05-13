import { BooruData, BooruResponses } from 'types'

import { CustomError } from '@/util/classes'
import { createPostFromData } from './Post'
import { createTagsFromData } from './Tags'

export default function processData({
  data,
  mode,
  booruType,
  limit,
}: any): any[] {
  const ProcessedData: any[] = []

  switch (mode) {
    case 'posts':
      switch (booruType) {
        case 'danbooru2':
          // E621 only
          if (data.posts) data = data.posts
          break

        // default:
        //   break
      }

      // Error handling
      if (!data.length) {
        throw new CustomError(
          'No data to return, maybe you have too many tags?',
          422
        )
      }

      data.forEach((post: any) => {
        ProcessedData.push(createPostFromData(booruType, post))
      })

      break

    case 'single-post':
      switch (booruType) {
        case 'danbooru2':
          // E621
          if (data.post) data = data.post

          data = [data]
          break

        default:
          break
      }

      // Error handling
      if (!data.length) {
        throw new CustomError(
          'No data to return, maybe you have too many tags?',
          422
        )
      }

      data.forEach((post: any) => {
        ProcessedData.push(createPostFromData(booruType, post))
      })
      break

    case 'tags':
      switch (booruType) {
        case 'shimmie2':
          // Error handling
          if (!Object.keys(data).length) {
            throw new CustomError(
              'No data to return, maybe you have too many tags?',
              422
            )
          }

          let counter = 0

          for (const prop of Object.entries(data)) {
            ProcessedData.push(createTagsFromData(booruType, prop))

            counter++

            if (counter >= limit) break
          }
          break

        default:
          // Error handling
          if (!data.length) {
            throw new CustomError(
              'No data to return, maybe you have too many tags?',
              422
            )
          }

          data.forEach((post: any) => {
            ProcessedData.push(createTagsFromData(booruType, post))
          })
          break
      }
      break

    default:
      throw new Error('No mode specified')
  }

  return ProcessedData
}
