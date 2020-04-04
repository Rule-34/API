// TEMPORARY

// Definitions
import { IPassedData } from 'passed-data.interface'
import { FetchedTagsRequest, ReturnedTagsRequest } from 'requests.interface'

// Classes
import { CustomError } from '@/util/classes'

/**
 * Cleans a Json object that contains tags
 * @param {Object} json Object containing tags to be cleaned
 * @param {String} domain Domain specific quirk treatment
 * @param {Number} limit Number to limit how many tags should be processed (Only used on some domains that do not have queries)
 */
export default ({
  data,
  domain,
  limit,
}: IPassedData): Array<ReturnedTagsRequest> => {
  const finalJson: Array<ReturnedTagsRequest> = []

  let counter = 0

  // Parse every tag result
  let iterableArray: Array<FetchedTagsRequest>

  switch (domain) {
    case 'paheal':
      // Paheal returns an pair key value JSON, so we have to encapsulate it

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      iterableArray = Object.entries(JSON.parse(data))
      break
    default:
      iterableArray = JSON.parse(data)
      break
  }

  // Error handling
  if (!iterableArray.length) {
    throw new CustomError(
      'No data to return, maybe you searched for an unknown tag?',
      422
    )
  }

  // Parse every tag result
  switch (domain) {
    case 'xxx':
    case 'safebooru':
      // XXX Api's returns html code so we need to decode it first
      for (const prop of iterableArray) {
        // Add object to array while extracting only digits
        finalJson.push({
          name: prop.value,
          count: Number(prop.label.match(/\d+/g)),
        })

        counter++

        // End array if we are at the specified limit
        if (counter >= limit) {
          break
        }
      }

      break

    case 'paheal':
      for (const prop of iterableArray) {
        // console.log(prop)

        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        finalJson.push({ name: prop[0], count: prop[1] })

        counter++

        // End array if we are at the specified limit
        if (counter >= limit) {
          break
        }
      }

      break

    case 'gelbooru':
      iterableArray.forEach((tag) => {
        finalJson.push({ name: tag.tag, count: Number(tag.count) })
      })
      break

    case 'danbooru':
    case 'e621':
    case 'loli':
      iterableArray.forEach((tag) => {
        finalJson.push({ name: tag.name, count: Number(tag.post_count) })
      })
      break
  }

  // And return it to the main function
  return finalJson
}
