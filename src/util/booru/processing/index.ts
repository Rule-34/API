import { Booru, Miscellaneous } from 'types'

import { EmptyDataError } from '@/util/classes'
import { createPostFromData } from './Post'
import { createTagFromData } from './Tags'

export default function processData({
  data,
  mode,
  booruType,
  limit,
}: Miscellaneous.DataBetweenFunctions): Booru.Structures.Data.Processed.Response[] {
  const ProcessedData: Booru.Structures.Data.Processed.Response[] = []

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
        throw new EmptyDataError()
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

        // default:
        //   break
      }

      // Error handling
      if (!data.length) {
        throw new EmptyDataError()
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
            throw new EmptyDataError()
          }

          let counter = 0

          for (const prop of Object.entries(data)) {
            ProcessedData.push(createTagFromData(booruType, prop as any))

            counter++

            if (counter >= limit) break
          }
          break

        default:
          // Error handling
          if (!data.length) {
            throw new EmptyDataError()
          }

          data.forEach((post: any) => {
            ProcessedData.push(createTagFromData(booruType, post))
          })
          break
      }
      break

    default:
      throw new Error('No mode specified')
  }

  return ProcessedData
}
