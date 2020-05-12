// Definitions
import { BooruResponses } from './types'

// Classes
import { CustomError } from '@/util/classes'

// Init
// import Debug from 'debug'
// const debug = Debug(`Server:util Post Cleaner`)

function createTagsFromData(
  fetchedTagsData: BooruResponses.TagRequest
): BooruResponses.TagResponse {
  const tmpJSON: BooruResponses.TagResponse = {
    name: undefined,
    count: undefined,
  }

  tmpJSON.name = fetchedTagsData.name ?? fetchedTagsData.tag

  tmpJSON.count = Number(fetchedTagsData.post_count ?? fetchedTagsData.count)
  return tmpJSON
}

export function ProcessTags(tagsArray: any): BooruResponses.TagResponse[] {
  const ProcessedPosts: BooruResponses.TagResponse[] = []

  if (tagsArray.xml) tagsArray = tagsArray.xml

  // Error handling
  if (!tagsArray.length) {
    throw new CustomError(
      'No data to return, maybe you have too many tags?',
      422
    )
  }

  tagsArray.forEach((post: BooruResponses.TagRequest) => {
    ProcessedPosts.push(createTagsFromData(post))
  })

  return ProcessedPosts
}
