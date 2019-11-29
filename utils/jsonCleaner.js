function jsonCleaner(json) {
  // Modifies every post
  json.posts.forEach(post => {
    // Make the string of tags an array
    post.tags = post.tags.trim().split(' ')

    // And add a media 'type' of the source
    if (post.high_res_file.match(/\.(jpeg|jpg|gif|png)$/)) {
      post.type = 'image'
    } else {
      post.type = 'video'
    }
  })

  // And returns the modified Json
  return json
}

module.exports = jsonCleaner
