// Definitions
import { BooruResponses } from '@/types/types'

// Init
// import Debug from 'debug'
// const debug = Debug(`Server:util Post Cleaner`)

export function createTagsFromData(
  booruType: string,
  fetchedTagsData: BooruResponses.TagRequest
): BooruResponses.TagResponse {
  const tmpJSON: BooruResponses.TagResponse = {
    name: undefined,
    count: undefined,
  }

  switch (booruType) {
    // Tags from internal autocomplete API
    case 'shimmie2':
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore // Disabled because I dont know how I could handle this weird response
      tmpJSON.name = fetchedTagsData[0]
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore // Disabled because I dont know how I could handle this weird response
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
