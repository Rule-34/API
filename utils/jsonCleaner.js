const generalConfig = require('../config/generalConfig'),
  he = require('he')

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
  if (json === undefined) {
    return { error: 'No data to return, maybe you have too many tags?' }
  }

  // Depending on domain we need to parse or not
  switch (domain) {
    case 'danbooru':
    case 'loli':
      evaluatedJson = JSON.parse(json)
      break

    default:
      evaluatedJson = json[0] // Typically Json from XML
      break
  }

  // Loop so we can extract only the things that we are gonna use
  evaluatedJson.forEach(post => {
    let tempJson = {}

    // Add id
    tempJson.id = post.id

    // Quirks of every domain
    switch (domain) {
      case 'danbooru': // Everything is different here as it doesnt come from the Camaro XML template
        // Images should be proxified so they can be cached and have CORS
        tempJson.high_res_file =
          'https://cors-proxy.rule34app.workers.dev/corsproxy/?apiurl=' +
          post.file_url

        tempJson.low_res_file =
          'https://cors-proxy.rule34app.workers.dev/corsproxy/?apiurl=' +
          post.large_file_url // Yes, for some reason 'large_file_url' is actually the low resolution one, blame danbooru

        tempJson.preview_file =
          'https://cors-proxy.rule34app.workers.dev/corsproxy/?apiurl=' +
          post.preview_file_url

        // Make the string of tags an array
        tempJson.tags = stringToArray(post.tag_string)
        break

      case 'xxx':
        // Images should be proxified so they can be cached and have CORS
        tempJson.high_res_file = post.high_res_file.replace('xxx/', 'xxx//')
        tempJson.low_res_file = post.low_res_file.replace('xxx/', 'xxx//')
        tempJson.preview_file = post.preview_file.replace('xxx/', 'xxx//')

        // Make the string of tags an array
        tempJson.tags = stringToArray(post.tags)
        break

      case 'paheal':
        // Images should be proxified so they can be cached and have CORS
        tempJson.high_res_file =
          'https://cors-proxy.rule34app.workers.dev/corsproxy/?apiurl=' +
          post.high_res_file

        // We skip low_res_file as it doesnt exist on paheal

        tempJson.preview_file =
          'https://cors-proxy.rule34app.workers.dev/corsproxy/?apiurl=' +
          post.preview_file

        // Make the string of tags an array
        tempJson.tags = stringToArray(post.tags)
        break

      case 'loli': // Everything is different here as it doesnt come from the Camaro XML template
        // Images should be proxified so they can be cached and have CORS
        tempJson.high_res_file =
          'https://cors-proxy.rule34app.workers.dev/corsproxy/?apiurl=' +
          post.file_url

        tempJson.low_res_file =
          'https://cors-proxy.rule34app.workers.dev/corsproxy/?apiurl=' +
          post.sample_url

        tempJson.preview_file =
          'https://cors-proxy.rule34app.workers.dev/corsproxy/?apiurl=' +
          post.preview_url

        // Make the string of tags an array
        tempJson.tags = stringToArray(post.tags)
        break

      default:
        console.error('No valid domain supplied')
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
  if (json === undefined) {
    return { error: 'No data to return, maybe you have too many tags?' }
  }

  switch (domain) {
    case 'xxx':
      // XXX Api's returns html code so we need to decode it first
      parsedJson = JSON.parse(
        he.decode(json, {
          strict: generalConfig.env === 'development' ? true : false,
        })
      )

      for (const prop in parsedJson) {
        // Add object to array while extracting only numbers
        finalJson.push({
          name: parsedJson[prop].value,
          posts: Number(parsedJson[prop].label.match(/\d+/g)),
        })

        // Add one to counter
        counter++

        // End array if we are at the specified limit
        if (counter >= limit) {
          break
        }
      }
      // End of loop

      break

    case 'paheal':
      parsedJson = JSON.parse(json)
      // Loop through every parsed prop of json
      for (const prop in parsedJson) {
        // Add object to array
        finalJson.push({ name: prop, posts: parsedJson[prop] })

        // Add one to counter
        counter++

        // End array if we are at the specified limit
        if (counter >= limit) {
          break
        }
      }
      // End of loop

      break

    case 'loli':
      parsedJson = JSON.parse(json)

      // Loop so we can extract only the things that we are gonna use
      parsedJson.forEach(tag => {
        // Push only things we use
        finalJson.push({ name: tag.name, posts: Number(tag.post_count) })
      })
      break
  }

  // And return it to the main function
  return finalJson
}

/**
 *
 * @param {Object} convertedJson Json Object to be cleaned
 * @param {String} template Specific treatment for the Json Object (posts, tags, autocomplete)
 * @param {String} domain Domain specific quirk treatment
 * @param {Boolean} isJson Boolean that tells if it was a Json payload or a XML one
 * @param {Number} limit Number to limit how many tags should be processed
 */
function jsonCleaner(convertedJson, template, domain, isJson, limit) {
  let cleanJson = {}

  switch (template) {
    // Clean json of unnecessary data
    case 'posts':
      cleanJson = postCleaner(convertedJson, domain)
      break

    // Returns an array from the json object at position 0
    case 'tags':
      cleanJson = jsonTagsCleaner(convertedJson, domain)
      break

    // Turns a json object into an array
    case 'autocomplete':
      cleanJson = jsonTagsCleaner(convertedJson, domain, limit)
      break
  }

  // And returns the modified Json
  return cleanJson
}

module.exports = jsonCleaner
