const generalConfig = require('../config/generalConfig'),
  debug = require('debug')(`Json Cleaner`),
  he = require('he')

let corsProxyUrl
/**
 * Helper function that returns an array from a passed String
 * @param {String} string String to get converted to array
 */
function stringToArray(string) {
  return string.trim().split(' ')
}

/**
 * Helper function that returns a boolean if String matches common video extensions
 * @param {String} media String used to test matches
 */
function isVideo(media) {
  return media.match(/\.(webm|mp4|ogg)$/)
}

/**
 *
 * @param {Object} json Json Object which contains post content
 * @param {String} domain Domain for specific quirk treatment
 */
function postCleaner(json, domain) {
  let finalJson = [],
    evaluatedJson = []

  // Error handling
  if (!json) {
    throw 'No data to parse'
  }

  // Parse JSON
  switch (domain) {
    // Converted from XML to JSON
    case 'xxx':
    case 'paheal':
    case 'gelbooru':
      evaluatedJson = json[0]
      break

    // Simple parse
    case 'danbooru':
    case 'e621':
    case 'loli':
      evaluatedJson = JSON.parse(json)
      break

    // Encapsulate on array
    case 'danbooru-single': // This is only for single-post viewing
    case 'e621-single': // This is only for single-post viewing
      evaluatedJson = [JSON.parse(json)]
      break

    // Exit with error as a domain is needed
    default:
      throw 'No domain supplied, a domain is needed'
  }

  // Loop each post to extract only the things that we are gonna use
  evaluatedJson.forEach(post => {
    let tempJson = {}

    // Add id
    tempJson.id = post.id

    // Proxy media files and skip to next if they have any media assigned
    switch (domain) {
      case 'xxx':
        if (!post.high_res_file) {
          debug(`Empty media: Skipping execution of ${tempJson.id}`)
          return
        }

        tempJson.high_res_file =
          corsProxyUrl + post.high_res_file.replace('xxx/', 'xxx//')

        tempJson.low_res_file =
          corsProxyUrl + post.low_res_file.replace('xxx/', 'xxx//')

        tempJson.preview_file =
          corsProxyUrl + post.preview_file.replace('xxx/', 'xxx//')

        break

      case 'paheal':
        if (!post.high_res_file) {
          debug(`Empty media: Skipping execution of ${tempJson.id}`)
          return
        }

        tempJson.high_res_file = corsProxyUrl + post.high_res_file

        // We skip low_res_file as it doesnt exist on paheal

        // TODO: THIS MIGHT BECAUSE OF THE XML TO JSON TRANSFORMATION

        tempJson.preview_file = corsProxyUrl + post.preview_file

        break

      case 'danbooru-single':
      case 'danbooru':
        if (!post.file_url) {
          debug(`Empty media: Skipping execution of ${tempJson.id}`)
          return
        }

        tempJson.high_res_file = corsProxyUrl + post.file_url

        tempJson.low_res_file = corsProxyUrl + post.large_file_url // Yes, for some reason 'large_file_url' is actually the low resolution one, blame danbooru

        tempJson.preview_file = corsProxyUrl + post.preview_file_url

        break

      // Similar to XXX but without replacing
      case 'gelbooru':
        if (!post.high_res_file) {
          debug(`Empty media: Skipping execution of ${tempJson.id}`)
          return
        }

        tempJson.high_res_file = corsProxyUrl + post.high_res_file

        tempJson.low_res_file = corsProxyUrl + post.low_res_file

        tempJson.preview_file = corsProxyUrl + post.preview_file

        break

      // Close to danbooru but low_res_file is different
      case 'e621':
      case 'e621-single':
      case 'loli':
        if (!post.file_url) {
          debug(`Empty media: Skipping execution of ${tempJson.id}`)
          return
        }

        tempJson.high_res_file = corsProxyUrl + post.file_url

        tempJson.low_res_file = corsProxyUrl + post.sample_url

        tempJson.preview_file = corsProxyUrl + post.preview_url

        break
    }

    // Convert the string to an array
    switch (domain) {
      case 'danbooru-single':
      case 'danbooru':
        tempJson.tags = stringToArray(post.tag_string)
        break

      default:
        tempJson.tags = stringToArray(post.tags)
        break
    }

    // Add source
    tempJson.source = post.source

    // Add a media 'type' of the source
    if (isVideo(tempJson.high_res_file)) {
      tempJson.type = 'video'
    } else {
      tempJson.type = 'image'
    }

    // Push it to the real json
    finalJson.push(tempJson)
  })

  // And return it to the main function
  return finalJson
}

// Clean json tags from unnecessary info
/**
 * Cleans a Json object that contains tags
 * @param {Object} json Object containing tags to be cleaned
 * @param {String} domain Domain specific quirk treatment
 * @param {Number} limit Number to limit how many tags should be processed (Only used on some domains that do not have queries)
 */
function jsonTagsCleaner(json, domain, limit) {
  let parsedJson = {},
    finalJson = [],
    counter = 0

  // Error handling
  if (!json) {
    return { error: 'No data to return, maybe you have too many tags?' }
  }

  // Parse every tag result
  switch (domain) {
    case 'xxx':
      // XXX Api's returns html code so we need to decode it first
      parsedJson = JSON.parse(
        he.decode(json, {
          strict: generalConfig.env === 'development' ? true : false,
        })
      )

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
      parsedJson = JSON.parse(json)

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
      parsedJson = JSON.parse(json)

      parsedJson.forEach(tag => {
        finalJson.push({ name: tag.tag, count: Number(tag.count) })
      })
      break

    case 'e621':
      parsedJson = JSON.parse(json)

      parsedJson.forEach(tag => {
        finalJson.push({ name: tag.name, count: Number(tag.count) })
      })
      break

    // Same as e621 but post count changes
    case 'danbooru':
    case 'loli':
      parsedJson = JSON.parse(json)

      parsedJson.forEach(tag => {
        finalJson.push({ name: tag.name, count: Number(tag.post_count) })
      })
      break
  }

  // And return it to the main function
  return finalJson
}

/**
 * Cleans a JSON object according to its template and domain
 * @param {Object} json Json Object to be cleaned
 * @param {String} template Specific treatment for the Json Object (posts, tags, autocomplete)
 * @param {String} domain Domain specific quirk treatment
 * @param {Number} limit Number to limit how many tags should be processed
 */
function jsonCleaner({ template, domain, json, limit, useCorsProxy }) {
  let cleanJson = {}

  // Define CORS Proxy URL
  if (useCorsProxy) {
    corsProxyUrl = 'https://cors-proxy.rule34app.workers.dev/?q='
  } else {
    corsProxyUrl = ''
  }

  switch (template) {
    // Clean json of unnecessary data
    case 'posts':
      cleanJson = postCleaner(json, domain)
      break

    // Returns an array from the json object at position 0
    case 'tags':
      cleanJson = jsonTagsCleaner(json, domain)
      break

    // Turns a json object into an array
    case 'autocomplete':
      cleanJson = jsonTagsCleaner(json, domain, limit)
      break
  }

  // And returns the modified Json
  return cleanJson
}

module.exports = jsonCleaner
