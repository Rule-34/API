// Modifies every post
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
function tagsCleaner(json) {
  // Reverse tag order so it starts with higher score
  json.tags = json.tags.reverse()

  // And return it to the main function
  return json
}

// Exported function that calls all the specified one based on template
function jsonCleaner(convertedJson, template) {
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
  }

  // And returns the modified Json
  return cleanJson
}

module.exports = jsonCleaner
