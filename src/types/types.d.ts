export namespace Booru {
  namespace Classes {
    namespace GenericBooru {
      interface QueryIdentifiers {
        posts: {
          limit: string
          pageID: string
          tags: string
          rating?: string
          score?: string
          order?: string
        }

        singlePost: {
          id?: string
        }

        tags: {
          tag: string
          tagEnding?: string
          limit?: string
          pageID?: string
          order?: string
          raw?: string
        }
      }

      interface Endpoints {
        base: string
        posts: string
        tags: string
        singlePost: string
        randomPost: string
      }
    }
  }

  namespace Structures {
    namespace Data {
      namespace Raw {
        interface Post {
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
          tags?: string | string[]
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
            url: string
            height: number
            width: number
          }
          low_res_file: {
            url: string
            height?: number
            width?: number
          }
          preview_file: {
            url: string
            height?: number
            width?: number
          }
          tags: string[]
          source: string[]
          rating: string
          type: string
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

export namespace Miscellaneous {
  interface DataBetweenFunctions {
    data?: any
    mode?: string
    booruType: string
    endpoint?: string
    limit?: number
  }
}
