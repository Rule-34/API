const generalConfig = require('../config/generalConfig'),
  he = require('he')

// Util for returning arrays from strings
function stringToArray(string) {
  return string.trim().split(' ')
}

// Util for returning boolean if matches video extension
function isVideo(media) {
  return media.match(/\.(webm|mp4|ogg)$/)
}

// Clean json from unnecessary info
function jsonPostsCleaner(json) {
  let parsedJson = JSON.parse(json),
    finalJson = { count: parsedJson.count, posts: [] } // Theres no count

  // Error handling
  if (json === undefined) {
    return { error: 'No data to return, maybe you have too many tags?' }
  }

  // Loop so we can extract only the things that we are gonna use
  parsedJson.forEach(post => {
    let tempJson = {}

    // Add id
    tempJson.id = post.id

    // Images should be proxified so they can be cached and have CORS
    tempJson.high_res_file = generalConfig.host + 'images?url=' + post.file_url
    tempJson.low_res_file = generalConfig.host + 'images?url=' + post.sample_url
    tempJson.preview_file =
      generalConfig.host + 'images?url=' + post.preview_url

    // Make the string of tags an array
    tempJson.tags = stringToArray(post.tags)

    // Add source
    tempJson.source = post.source

    // Add a media 'type' of the source
    if (isVideo(tempJson.high_res_file)) {
      tempJson.type = 'video'
    } else {
      tempJson.type = 'image'
    }

    // Push it to the real json
    finalJson.posts.push(tempJson)
  })

  // And return it to the main function
  return finalJson
}

// Clean json tags from unnecessary info
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

// Cleans individual posts from XML API
function postsCleaner(json, domain) {
  // Error handling
  if (json.posts === undefined) {
    return { error: 'No data to return, maybe you have too many tags?' }
  }

  json.posts.forEach(post => {
    // Make the string of tags an array
    post.tags = stringToArray(post.tags)

    // Images should be proxified so they can be cached and have CORS
    post.high_res_file = generalConfig.host + 'images?url=' + post.high_res_file
    post.low_res_file = generalConfig.host + 'images?url=' + post.low_res_file
    post.preview_file = generalConfig.host + 'images?url=' + post.preview_file

    // Quirks of every domain, optional
    switch (domain) {
      // This is done for rule34.xxx so it doesnt redirect you to the post of the image
      case 'xxx':
        post.high_res_file = post.high_res_file.replace('xxx/', 'xxx//')
        post.low_res_file = post.low_res_file.replace('xxx/', 'xxx//')
        post.preview_file = post.preview_file.replace('xxx/', 'xxx//')
        break

      case 'paheal':
        delete post.low_res_file
        break
    }
    // Add a media 'type' of the source
    if (isVideo(post.high_res_file)) {
      post.type = 'video'
    } else {
      post.type = 'image'
    }
  })

  // And return it to the main function
  return json
}

// Exported function that calls all the specified one based on template
function jsonCleaner(convertedJson, template, domain, isJson, limit) {
  let cleanJson = {}

  switch (template) {
    // Clean json of unneded data
    case 'posts':
      if (isJson) {
        cleanJson = jsonPostsCleaner(convertedJson)
      } else {
        cleanJson = postsCleaner(convertedJson, domain)
      }
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
