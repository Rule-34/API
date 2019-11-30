// Cleans individual posts from XML API
function postsCleaner(json) {
  json.posts.forEach(post => {
    // Make the string of tags an array
    post.tags = post.tags.trim().split(' ')

    // Add a media 'type' of the source
    if (post.high_res_file.match(/\.(jpeg|jpg|gif|png)$/)) {
      post.type = 'image'
    } else {
      post.type = 'video'
    }
  })

  // And return it to the main function
  return json
}

// Cleans tags from XML API
function tagsCleaner(json) {
  // Reverse tag order so it starts with higher score
  json.tags = json.tags.reverse()

  // And return it to the main function
  return json
}

// Cleans json from autocomplete API
function autoCompleteCleaner(json, limit) {
  const parsedJson = JSON.parse(json),
    finalJson = []
  let counter = 0

  // Loop through every parsed prop of json
  for (const prop in parsedJson) {
    // Add object to array
    finalJson.push({ tag: prop, count: parsedJson[prop] })

    // End array if we are at the specified limit
    if (counter >= limit) {
      break
    }

    // Add one to counter
    counter++
  }

  // And return it to the main function
  return finalJson
}

// Exported function that calls all the specified one based on template
function jsonCleaner(convertedJson, template, limit) {
  let cleanJson = {}

  switch (template) {
    // Clean json of unneded data
    case 'posts':
      cleanJson = postsCleaner(convertedJson)
      break

    // Comes perfectly clean
    case 'tags':
      cleanJson = tagsCleaner(convertedJson)
      break

    // Turns a json object into an array
    case 'autocomplete':
      cleanJson = autoCompleteCleaner(convertedJson, limit) // In this case template is really 'limit'
      break
  }

  // And returns the modified Json
  return cleanJson
}

module.exports = jsonCleaner
