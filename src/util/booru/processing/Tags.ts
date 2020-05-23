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
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore // Disabled because I dont know how I could handle this weird response
      Tag.name = fetchedTagsData[0]
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore // Disabled because I dont know how I could handle this weird response
      Tag.count = fetchedTagsData[1]
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
