// Definitions
import { IPassedData } from 'passed-data.interface'

// Classes
import { CustomError } from '@/util/classes'

/**
 * Cleans a Json object that contains tags
 * @param {Object} json Object containing tags to be cleaned
 * @param {String} domain Domain specific quirk treatment
 * @param {Number} limit Number to limit how many tags should be processed (Only used on some domains that do not have queries)
 */
export default ({ data, domain, limit }: IPassedData): Array<object> => {
  const finalJson: Array<object> = []

  let iterableJson: Array<object> = [],
    counter = 0

  // Parse every tag result
  iterableJson = JSON.parse(data)

  // Error handling
  if (!iterableJson.length) {
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
      for (const prop in iterableJson) {
        // Add object to array while extracting only digits
        finalJson.push({
          name: iterableJson[prop].value,
          count: Number(iterableJson[prop].label.match(/\d+/g)),
        })

        counter++

        // End array if we are at the specified limit
        if (counter >= limit) {
          break
        }
      }

      break

    case 'paheal':
      for (const prop in iterableJson) {
        finalJson.push({ name: prop, count: iterableJson[prop] })

        counter++

        // End array if we are at the specified limit
        if (counter >= limit) {
          break
        }
      }

      break

    case 'gelbooru':
      iterableJson.forEach((tag) => {
        finalJson.push({ name: tag.tag, count: Number(tag.count) })
      })
      break

    case 'danbooru':
    case 'e621':
    case 'loli':
      iterableJson.forEach((tag) => {
        finalJson.push({ name: tag.name, count: Number(tag.post_count) })
      })
      break
  }

  // And return it to the main function
  return finalJson
}
