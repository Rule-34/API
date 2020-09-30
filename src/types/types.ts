export declare namespace Booru {
  namespace Structures {
    namespace Data {
      namespace Raw {
        interface Post {
          /*
           * ID
           */
          id: number

          /*
           * Score
           */
          score: number | { total: number }

          /*
           * Media
           */

          // High res file
          high_res_file: { url: string; height: number; width: number } // Transformed XML
          file_url: string
          file: { url: string; height: number; width: number }

          height: number
          image_height: number
          width: number
          image_width: number

          // Low res file
          low_res_file: { url: string; height: number; width: number } // Transformed XML
          large_file_url: string
          sample: { url: string; height: number; width: number }
          sample_url: string

          sample_height: number
          sample_width: number

          // Preview res file
          preview_file: { url: string; height: number; width: number } // Transformed XML
          preview_file_url: string
          preview: { url: string; height: number; width: number }
          preview_url: string

          preview_height: number
          preview_width: number

          /*
           * Tags
           */
          tags: string | string[]
          tag_string: string

          /*
           * Source
           */
          sources: Array<string>
          source: string
          source_url: string

          /*
           * Rating
           */
          rating: string
        }

        interface Tag {
          value?: string
          label?: string
          tag?: string
          name?: string
          post_count?: number
          count?: number
        }
      }

      namespace Processed {
        type Response = Post | Tag

        interface Post {
          id: number
          score: number
          high_res_file: {
            url: string | null
            height: number | null
            width: number | null
          }
          low_res_file: {
            url: string | null
            height: number | null
            width: number | null
          }
          preview_file: {
            url: string | null
            height: number | null
            width: number | null
          }
          tags: string[]
          source: string[]
          rating: string
          media_type: string
        }

        interface Tag {
          name: string
          count: number
        }
      }
    }

    namespace Requests {
      namespace Queries {
        interface Posts {
          limit?: number
          pageID?: number
          tags?: string
          rating?: string
          score?: string
          order?: string
        }

        interface SinglePost {
          id: number
        }

        interface RandomPost {
          limit?: number
          tags?: string
          rating?: string
          score?: string
        }

        interface Tags {
          tag: string
          limit?: number
          pageID?: number
          order?: string
        }
      }
    }
  }
}

export declare namespace Miscellaneous {
  interface DataBetweenFunctions {
    data?: any
    mode?: string
    booruType: string
    endpoint?: string
    limit?: number
  }
}