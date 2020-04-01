
/**
 * Posts
 */
export interface ReturnedPostsRequest {
  id: number,
  high_res_file: string,
  low_res_file: string,
  preview_file: string,
  tags: Array<string>,
  source: string,
  rating: string,
  type: string,
  }
  
  export interface FetchedPostsRequest {
    /**
     * ID
     */
    id: number,

    /**
     * Media
     */
    // Large res file
    high_res_file?: string,
    file_url?: string,
    file?: {url: string},

    // Medium res file
    low_res_file?: string,
    large_file_url?: string,
    sample?: {url: string},
    sample_url?: string,

    // Low res file
    preview_file?: string,
    preview_file_url?: string,
    preview?: {url: string},
    preview_url?: string,

    /**
     * Tags
     */
    tags?: string,
    tag_string?: string,

    /**
     * Source
     */
    sources?: Array<string>,
    source?: string,

    /**
     * Rating
     */
    rating: string,

    /**
     * Type
     */
    type: string,
  }

/**
 * Tags
 */
export interface ReturnedTagsRequest {
    name: string
    count: number
  }
  
  export interface FetchedTagsRequest {
    // Name
    value?: string
    name?: string
    label?: string
    tag?: string
    // Count
    count?: string | number
    post_count?: string | number
  }