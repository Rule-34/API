// Definitions
import { BooruResponses, BooruData } from '@/types/types'

// Init
// import Debug from 'debug'
// const debug = Debug(`Server:util Post Cleaner`)

export class Post {
  // Configuration variables
  private booruType: BooruData.DataBetweenFunctions['booruType']
  private rawData: BooruResponses.PostRequest

  // Post variables
  private id: BooruResponses.PostResponse['id']
  private score: BooruResponses.PostResponse['score']
  private high_res_file: BooruResponses.PostResponse['high_res_file']
  private low_res_file: BooruResponses.PostResponse['low_res_file']
  private preview_file: BooruResponses.PostResponse['preview_file']
  private tags: BooruResponses.PostResponse['tags']
  private source: BooruResponses.PostResponse['source']
  private rating: BooruResponses.PostResponse['rating']
  private type: BooruResponses.PostResponse['type']

  constructor(
    booruType: BooruData.DataBetweenFunctions['booruType'],
    fetchedPostData: BooruResponses.PostRequest
  ) {
    this.booruType = booruType
    this.rawData = fetchedPostData

    /*
     * ID
     */
    this.setID()

    /*
     * Score
     */
    this.setScore()

    /*
     * File URLs
     */
    this.setFiles()

    /*
     * Tags
     */
    this.setTags()

    /*
     * Source
     */
    this.setSource()

    /*
     * Rating
     */
    this.setRating()

    /*
     * Media type
     */
    this.setMediaType()
  }

  private setID(): void {
    this.id = this.rawData.id
  }

  private setScore(): void {
    switch (this.booruType) {
      case 'danbooru2':
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore // Disabled because I dont know how I could do this
        if (typeof this.rawData.score.total === 'number') {
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore // Disabled because I dont know how I could do this
          this.score = this.rawData.score.total
          break
        }
        this.score = this.rawData.score as number
        break

      default:
        this.score = this.rawData.score as number
        break
    }
  }

  private setFiles(): void {
    switch (this.booruType) {
      case 'danbooru2':
        // E621
        if (this.rawData.file) {
          this.high_res_file = {
            url: this.rawData.file.url,
            width: this.rawData.file.width,
            height: this.rawData.file.height,
          }

          this.low_res_file = {
            url: this.rawData.sample.url,
            width: this.rawData.sample.width,
            height: this.rawData.sample.height,
          }

          this.preview_file = {
            url: this.rawData.preview.url,
            width: this.rawData.preview.width,
            height: this.rawData.preview.height,
          }

          break
        }

        // Most danbooru2 types
        this.high_res_file = {
          url: this.rawData.file_url,
          width: this.rawData.image_width,
          height: this.rawData.image_height,
        }

        this.low_res_file = {
          url: this.rawData.large_file_url,
        }

        this.preview_file = {
          url: this.rawData.preview_file_url,
        }
        break

      default:
        this.high_res_file = this.rawData.high_res_file
        this.low_res_file = this.rawData.low_res_file
        this.preview_file = this.rawData.preview_file
        break
    }

    // Delete empty "" urls
    if (this.high_res_file.url === '') this.high_res_file.url = null
    if (this.low_res_file.url === '') this.low_res_file.url = null
    if (this.preview_file.url === '') this.preview_file.url = null

    // Fix for rule34.xxx
    if (RegExp('xxx/').test(this.high_res_file.url)) {
      this.high_res_file.url = this.high_res_file.url.replace('xxx/', 'xxx//')
      this.low_res_file.url = this.low_res_file.url.replace('xxx/', 'xxx//')
      this.preview_file.url = this.preview_file.url.replace('xxx/', 'xxx//')
    }
  }

  private setTags(): void {
    switch (this.booruType) {
      case 'danbooru2':
        if (this.rawData.tag_string) {
          this.tags = this.rawData.tag_string?.trim().split(' ')
          break
        }

        this.tags = []

        Object.keys(this.rawData.tags).forEach((tagContainer) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          this.tags = this.tags.concat(this.rawData.tags[tagContainer])
        })
        break

      default:
        this.tags = (this.rawData.tags as string)?.trim().split(' ')
        break
    }

    // Remove duplicates
    this.tags = [...new Set(this.tags)]
  }

  private setSource(): void {
    switch (this.booruType) {
      case 'danbooru2':
        if (this.rawData.sources) {
          this.source = this.rawData.sources
          break
        }

        this.source = [this.rawData.source]
        break

      default:
        this.source = [this.rawData.source]
        break
    }

    // Remove empty "" sources
    this.source.forEach((source, index) => {
      if (source === '') this.source.splice(index)
    })
  }

  private setRating(): void {
    switch (this.rawData.rating) {
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
  }

  private setMediaType(): void {
    this.type = /\.(webm|mp4|ogg)$/.test(this.high_res_file.url)
      ? 'video'
      : 'image'
  }

  public toObject(): BooruResponses.PostResponse {
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
