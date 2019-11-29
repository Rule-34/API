function jsonCleaner(json) {
  // console.log('XML DATA IS', xml)
  json.posts.forEach(post => {
    post.tags = post.tags.trim().split(' ')
    if (post.high_res_file.match(/\.(jpeg|jpg|gif|png)$/)) {
      post.type = 'image'
    } else {
      post.type = 'video'
    }
  })

  return json
}

module.exports = jsonCleaner
