// Definitions
import { Booru } from '@/types/types'

abstract class GenericBooruPost {
  rawData: Booru.Structures.Data.Raw.Post

  id!: Booru.Structures.Data.Processed.Post['id']
  score!: Booru.Structures.Data.Processed.Post['score']
  high_res_file!: Booru.Structures.Data.Processed.Post['high_res_file']
  low_res_file!: Booru.Structures.Data.Processed.Post['low_res_file']
  preview_file!: Booru.Structures.Data.Processed.Post['preview_file']
  tags!: Booru.Structures.Data.Processed.Post['tags']
  source!: Booru.Structures.Data.Processed.Post['source']
  rating!: Booru.Structures.Data.Processed.Post['rating']
  media_type!: Booru.Structures.Data.Processed.Post['media_type']
  constructor(fetchedPostData: Booru.Structures.Data.Raw.Post) {
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

    // Delete empty "" urls
    if (this.high_res_file.url === '') this.high_res_file.url = null
    if (this.low_res_file.url === '') this.low_res_file.url = null
    if (this.preview_file.url === '') this.preview_file.url = null

    /*
     * Tags
     */
    this.setTags()

    // Remove duplicates
    this.tags = [...new Set(this.tags)]

    /*
     * Source
     */
    this.setSource()

    // Remove empty "" sources
    this.source.forEach((source, index) => {
      if (source === '') this.source.splice(index)
    })

    /*
     * Rating
     */
    this.setRating()

    /*
     * Media type
     */
    this.setMediaType()
  }

  protected setID(): void {
    this.id = this.rawData.id
  }

  protected abstract setScore(): void

  protected abstract setFiles(): void

  protected abstract setTags(): void

  protected abstract setSource(): void

  protected setRating(): void {
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

  protected setMediaType(): void {
    if (!this.high_res_file.url) {
      this.media_type = 'unknown'
      return
    }

    this.media_type = /\.(webm|mp4|ogg)$/.test(this.high_res_file.url)
      ? 'video'
      : 'image'
  }

  public toJSON(): Booru.Structures.Data.Processed.Post {
    return {
      id: this.id,
      score: this.score,
      high_res_file: this.high_res_file,
      low_res_file: this.low_res_file,
      preview_file: this.preview_file,
      tags: this.tags,
      source: this.source,
      rating: this.rating,
      media_type: this.media_type,
    }
  }
}

export class GelbooruPost extends GenericBooruPost {
  protected setScore(): void {
    this.score = this.rawData.score as number
  }

  protected setFiles(): void {
    this.high_res_file = this.rawData.high_res_file
    this.low_res_file = this.rawData.low_res_file
    this.preview_file = this.rawData.preview_file

    // Fix for rule34.xxx
    if (RegExp('xxx/').test(this.high_res_file.url as string)) {
      this.high_res_file.url = (this.high_res_file.url as string).replace(
        'xxx/',
        'xxx//'
      )
      this.low_res_file.url = (this.low_res_file.url as string).replace(
        'xxx/',
        'xxx//'
      )
      this.preview_file.url = (this.preview_file.url as string).replace(
        'xxx/',
        'xxx//'
      )
    }
  }

  protected setTags(): void {
    this.tags = (this.rawData.tags as string)?.trim().split(' ')
  }

  protected setSource(): void {
    this.source = [this.rawData.source]
  }
}

export class Shimmie2Post extends GelbooruPost {}
export class DanbooruPost extends GelbooruPost {}

export class Danbooru2Post extends GenericBooruPost {
  protected setScore(): void {
    this.score = this.rawData.score as number
  }

  protected setFiles(): void {
    this.high_res_file = {
      url: this.rawData.file_url,
      width: this.rawData.image_width,
      height: this.rawData.image_height,
    }

    this.low_res_file = {
      url: this.rawData.large_file_url,
      width: null,
      height: null,
    }

    this.preview_file = {
      url: this.rawData.preview_file_url,
      width: null,
      height: null,
    }
  }

  protected setTags(): void {
    this.tags = this.rawData.tag_string?.trim().split(' ')
    // Object.keys(this.rawData.tags).forEach((tagContainer) => {
    //   this.tags = this.tags.concat(tagContainer)
    // })
  }

  protected setSource(): void {
    this.source = [this.rawData.source]
  }
}

export class E621Post extends GenericBooruPost {
  protected setScore(): void {
    this.score = (this.rawData.score as { total: number }).total
  }

  protected setFiles(): void {
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
  }

  protected setTags(): void {
    this.tags = []

    Object.keys(this.rawData.tags).forEach((tagContainer) => {
      this.tags = this.tags.concat(this.rawData.tags[tagContainer as any])
    })
  }

  protected setSource(): void {
    this.source = this.rawData.sources
  }
}
