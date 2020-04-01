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