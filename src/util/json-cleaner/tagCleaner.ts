// @ts-nocheck

// Definitions
import { IPassedData } from 'passed-data.interface'

/**
 * Cleans a Json object that contains tags
 * @param {Object} json Object containing tags to be cleaned
 * @param {String} domain Domain specific quirk treatment
 * @param {Number} limit Number to limit how many tags should be processed (Only used on some domains that do not have queries)
 */
export default ({ data, domain, limit }: IPassedData): Array<object> => {
  const finalJson = []

  let parsedJson = {},
    counter = 0

  // Error handling
  if (!data) {
    throw new Error('No data to return, maybe you have too many tags?')
  }

  // Parse every tag result
  switch (domain) {
    case 'xxx':
    case 'safebooru':
    case 'paheal':
    case 'danbooru':
    case 'gelbooru':
    case 'loli':
    case 'e621':
      parsedJson = JSON.parse(data)
      break
  }

  // Parse every tag result
  switch (domain) {
    case 'xxx':
    case 'safebooru':
      // XXX Api's returns html code so we need to decode it first
      for (const prop in parsedJson) {
        // Add object to array while extracting only digits
        finalJson.push({
          name: parsedJson[prop].value,
          count: Number(parsedJson[prop].label.match(/\d+/g)),
        })

        counter++

        // End array if we are at the specified limit
        if (counter >= limit) {
          break
        }
      }

      break

    case 'paheal':
      for (const prop in parsedJson) {
        finalJson.push({ name: prop, count: parsedJson[prop] })

        counter++

        // End array if we are at the specified limit
        if (counter >= limit) {
          break
        }
      }

      break

    case 'gelbooru':
      parsedJson.forEach((tag) => {
        finalJson.push({ name: tag.tag, count: Number(tag.count) })
      })
      break

    case 'danbooru':
    case 'e621':
    case 'loli':
      parsedJson.forEach((tag) => {
        finalJson.push({ name: tag.name, count: Number(tag.post_count) })
      })
      break
  }

  // And return it to the main function
  return finalJson
}
