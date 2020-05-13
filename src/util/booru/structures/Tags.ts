// Definitions
import { BooruResponses, BooruData } from '@/types/types'

// Classes
import { CustomError } from '@/util/classes'

// Init
// import Debug from 'debug'
// const debug = Debug(`Server:util Post Cleaner`)

function createTagsFromData(
  booruType: string,
  fetchedTagsData: any
): BooruResponses.TagResponse {
  const tmpJSON: BooruResponses.TagResponse = {
    name: undefined,
    count: undefined,
  }
  switch (booruType) {
    // Tags from internal autocomplete API
    case 'shimmie2':
      tmpJSON.name = fetchedTagsData[0]
      tmpJSON.count = fetchedTagsData[1]
      break

    // Tags from transfromed XML
    case 'danbooru':
    case 'gelbooru':
      tmpJSON.name = fetchedTagsData.name

      tmpJSON.count = fetchedTagsData.count
      break

    case 'danbooru2':
      tmpJSON.name = fetchedTagsData.name
      tmpJSON.count = fetchedTagsData.post_count
      break
  }
  return tmpJSON
}

export function ProcessTags(
  { booruType, limit }: BooruData.DataBetweenFunctions,
  tagsArray: any
): BooruResponses.TagResponse[] {
  const ProcessedPosts: BooruResponses.TagResponse[] = []

  switch (booruType) {
    case 'shimmie2':
      // Error handling
      if (!Object.keys(tagsArray).length) {
        throw new CustomError(
          'No data to return, maybe you have too many tags?',
          422
        )
      }

      let counter = 0

      for (const prop of Object.entries(tagsArray)) {
        ProcessedPosts.push(createTagsFromData(booruType, prop))

        counter++

        if (counter >= limit) break
      }
      break

    default:
      // Error handling
      if (!tagsArray.length) {
        throw new CustomError(
          'No data to return, maybe you have too many tags?',
          422
        )
      }

      tagsArray.forEach((post: any) => {
        ProcessedPosts.push(createTagsFromData(booruType, post))
      })
      break
  }

  return ProcessedPosts
}
