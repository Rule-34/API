// Definitions
import { BooruResponses } from '@/types/types'

// Init
// import Debug from 'debug'
// const debug = Debug(`Server:util Post Cleaner`)

export function createTagsFromData(
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
