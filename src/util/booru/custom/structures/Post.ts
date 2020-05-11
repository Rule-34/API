import { PostResponse, PostRequest } from './types'

export class Post {
  // Fixes related
  public booru: string

  // Post related
  public id: number
  public score: number
  public high_res_file: PostResponse['high_res_file']
  public low_res_file: PostResponse['low_res_file']
  public preview_file: PostResponse['preview_file']
  public tags: string[]
  public source: string[]
  public rating: string
  public type: string
  constructor(booru: string, fetchedPostData: PostRequest) {
    /*
     * Booru Type
     */
    this.booru = booru

    /*
     * ID
     */
    this.id = fetchedPostData.id

    /*
     * Score
     */
    this.score = Number(fetchedPostData.score ?? fetchedPostData.score.total)

    /*
     * File URLs
     */
    this.high_res_file = {
      url:
        // rule34.xxx | rule34.paheal.net | gelbooru | safebooru - XML transformed boorus
        fetchedPostData.high_res_file.url ??
        // lolibooru | danbooru
        fetchedPostData.file_url ??
        // E621 - Modern boorus
        fetchedPostData.file.url,

      height:
        // rule34.xxx | rule34.paheal.net | gelbooru | safebooru - XML transformed boorus
        fetchedPostData.high_res_file.height ??
        // lolibooru
        fetchedPostData.height ??
        // E621 - Modern boorus
        fetchedPostData.file.height ??
        // danbooru.donmai.us
        fetchedPostData.image_height,

      width:
        // rule34.xxx | rule34.paheal.net | gelbooru | safebooru - XML transformed boorus
        fetchedPostData.high_res_file.width ??
        // lolibooru
        fetchedPostData.width ??
        // E621 - Modern boorus
        fetchedPostData.file.width ??
        // danbooru.donmai.us
        fetchedPostData.image_width,
    }

    this.low_res_file = {
      url:
        // rule34.xxx | rule34.paheal.net | gelbooru | safebooru - XML transformed boorus
        fetchedPostData.low_res_file.url ??
        // lolibooru
        fetchedPostData.sample_url ??
        // E621 - Modern boorus
        fetchedPostData.sample.url ??
        // danbooru.donmai.us
        fetchedPostData.large_file_url,

      height:
        // rule34.xxx | rule34.paheal.net | gelbooru | safebooru - XML transformed boorus
        fetchedPostData.low_res_file.height ??
        // lolibooru
        fetchedPostData.sample_height ??
        // E621 - Modern boorus
        fetchedPostData.sample.height,

      width:
        // rule34.xxx | rule34.paheal.net | gelbooru | safebooru - XML transformed boorus
        fetchedPostData.low_res_file.width ??
        // lolibooru
        fetchedPostData.sample_width ??
        // E621 - Modern boorus
        fetchedPostData.sample.width,
    }

    this.preview_file = {
      url:
        // rule34.xxx | rule34.paheal.net | gelbooru | safebooru - XML transformed boorus
        fetchedPostData.preview_file.url ??
        // E621
        fetchedPostData.preview.url ??
        // danbooru.donmai.us
        fetchedPostData.preview_file_url,

      height:
        // rule34.xxx | rule34.paheal.net | gelbooru | safebooru - XML transformed boorus
        fetchedPostData.preview_file.height ??
        // lolibooru
        fetchedPostData.preview_height ??
        // E621
        fetchedPostData.preview.height,

      width:
        // rule34.xxx | rule34.paheal.net | gelbooru | safebooru - XML transformed boorus
        fetchedPostData.preview_file.width ??
        // lolibooru
        fetchedPostData.preview_width ??
        // E621
        fetchedPostData.preview.width,
    }

    /*
     * Tags
     */

    this.tags =
      // rule34.xxx | rule34.paheal.net | gelbooru | safebooru - XML transformed boorus
      (fetchedPostData.tags as string)?.trim().split(' ') ??
      // danbooru.donmai.us
      fetchedPostData.tag_string?.trim().split(' ')

    if (!this.tags.length) {
      const tempTags: string[] = []

      // E621 - TODO: will probably break something
      ;(fetchedPostData.tags as [string[]]).forEach((tagContainer) => {
        tempTags.concat(tagContainer)
      })
    }

    /*
     * Source
     */
    this.source =
      // Usual
      [fetchedPostData.source] ?? [fetchedPostData.source_url] ?? // E621
      //  Unknown
      fetchedPostData.sources

    /*
     * Rating
     */
    switch (fetchedPostData.rating) {
      case 'e':
        this.rating = 'explicit'
        break

      case 'q':
      case 'suggestive': // Derpibooru
        this.rating = 'questionable'
        break

      case 's':
        this.rating = 'safe'
        break

      case 'u':
        this.rating = 'unrated'
        break

      default:
        this.rating = 'unknown'
        break
    }

    /*
     * Media type
     */
    this.type = /\.(webm|mp4|ogg)$/.test(this.high_res_file.url)
      ? 'video'
      : 'image'
  }

  /**
   * Converts Class to object
   */
  public toObject(): PostResponse {
    return {
      id: this.id,
      score: this.score,
      high_res_file: this.high_res_file,
      low_res_file: this.low_res_file,
      preview_file: this.preview_file,
      tags: this.tags,
      source: this.source,
      rating: this.rating,
      type: this.type,
    }
  }
}
