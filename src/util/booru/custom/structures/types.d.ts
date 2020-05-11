export interface PostResponse {
  id: number
  score: number
  high_res_file: {
    url: string
    height: number
    width: number
  }
  low_res_file: {
    url: string
    height: number
    width: number
  }
  preview_file: {
    url: string
    height: number
    width: number
  }
  tags: string[]
  source: string[]
  rating: string
  type: string
}

export interface PostRequest {
  /**
   * ID
   */
  id: number

  /**
   * Score
   */
  score: number | { total: number }

  /**
   * Media
   */

  // High res file
  high_res_file?: { url: string; height: number; width: number } // Transformed XML
  file_url?: string
  file?: { url: string; height: number; width: number }

  height?: number
  image_height?: number
  width?: number
  image_width?: number

  // Low res file
  low_res_file?: { url: string; height: number; width: number } // Transformed XML
  large_file_url?: string
  sample?: { url: string; height: number; width: number }
  sample_url?: string

  sample_height?: number
  sample_width?: number

  // Preview res file
  preview_file?: { url: string; height: number; width: number } // Transformed XML
  preview_file_url?: string
  preview?: { url: string; height: number; width: number }
  preview_url?: string

  preview_height?: number
  preview_width?: number

  /**
   * Tags
   */
  tags?: string | [string[]]
  tag_string?: string

  /**
   * Source
   */
  sources?: Array<string>
  source?: string
  source_url?: string

  /**
   * Rating
   */
  rating: string
}

export interface ProcessedQueries {
  limit: number
  pageID: number
  tags: string
  rating: string
  score: number
  order: string

  // SINGLE POST
  postID: number

  // TAGS
  tag: string
}
