const generalConfig = require('../config/generalConfig'),
  he = require('he')

// Cleans individual posts from XML API
function postsCleaner(json, domain) {
  // Error handling
  if (json.posts === undefined) {
    return { error: 'No data to return, maybe you have too many tags?' }
  }

  json.posts.forEach(post => {
    // Make the string of tags an array
    post.tags = post.tags.trim().split(' ')

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
    if (post.high_res_file.match(/\.(webm|mp4|ogg)$/)) {
      post.type = 'video'
    } else {
      post.type = 'image'
    }
  })

  // And return it to the main function
  return json
}

// Cleans json from autocomplete API
function autoCompleteCleaner(json, domain, limit) {
  let parsedJson = {},
    finalJson = [],
    counter = 0

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
  }

  // And return it to the main function
  return finalJson
}

// Exported function that calls all the specified one based on template
function jsonCleaner(convertedJson, template, domain, limit) {
  let cleanJson = {}

  switch (template) {
    // Clean json of unneded data
    case 'posts':
      cleanJson = postsCleaner(convertedJson, domain)
      break

    // Turns a json object into an array
    case 'autocomplete':
      cleanJson = autoCompleteCleaner(convertedJson, domain, limit)
      break

    // Returns an array from the json object at position 0
    case 'tags':
      cleanJson = convertedJson[0]
      break
  }

  // And returns the modified Json
  return cleanJson
}

module.exports = jsonCleaner
