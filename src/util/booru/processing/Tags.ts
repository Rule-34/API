// Definitions
import { Booru } from '@/types/types'

// Init
// import Debug from 'debug'
// const debug = Debug(`Server:util Post Cleaner`)

export function createTagFromData(
  booruType: string,
  fetchedTagsData: Booru.Structures.Data.Raw.Tag
): Booru.Structures.Data.Processed.Tag {
  const Tag: Booru.Structures.Data.Processed.Tag = {
    name: undefined,
    count: undefined,
  }

  switch (booruType) {
    // Tags from internal autocomplete API
    case 'shimmie2':
      // These type of tags are html, very weird
      Tag.name = (fetchedTagsData as any)[0]
      Tag.count = (fetchedTagsData as any)[1]
      break

    // Tags from transformed XML
    case 'danbooru':
    case 'gelbooru':
      // For autocomplete.php boorus (like rule34.xxx)
      if (fetchedTagsData.label) {
        Tag.name = fetchedTagsData.value

        Tag.count = Number(fetchedTagsData.label.match(/\d+/g))
        break
      }

      Tag.name = fetchedTagsData.name
      Tag.count = fetchedTagsData.count
      break

    case 'danbooru2':
      Tag.name = fetchedTagsData.name
      Tag.count = fetchedTagsData.post_count
      break
  }
  return Tag
}
