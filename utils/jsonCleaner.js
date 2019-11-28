const cleanJson = {
  count: '',
  posts: [],
}

function jsonCleaner(json) {
  // console.log('XML DATA IS', xml)
  return new Promise(function(resolve) {
    // Apply count with a simpler tree
    cleanJson.count = json.posts.$.count

    // All post transformation is done here
    json.posts.post.forEach(post => {
      // New object so its clean and without unnecessary info
      let cleanPost = {}

      /* METADATA RELATED */
      cleanPost.id = post.$.id

      /* SOURCE RELATED */
      cleanPost.high_res_file = post.$.file_url
      cleanPost.low_res_file = post.$.sample_url
      cleanPost.preview_file = post.$.preview_url

      /* TAG RELATED */
      // Transform string to array
      cleanPost.tags = post.$.tags.trim().split(' ')

      /* MEDIA TYPE RELATED */
      // Check if its an image or a video
      if (post.$.file_url.match(/\.(jpeg|jpg|gif|png)$/)) {
        cleanPost.type = 'image'
      } else {
        cleanPost.type = 'video'
      }

      // Push post to clean Json
      cleanJson.posts.push(cleanPost)
    })

    // Return the clean json object
    resolve(cleanJson)
  })
}

module.exports = jsonCleaner

/* Unnecessary for now

      // Check if theres source
      if (post.$.file_url) {
        return
      } else {
        // If theres no source then dont push post
        return
      }

      */
