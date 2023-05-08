import { ResponseDto } from './response.dto'
import {
  booruQueryValuesPostsDTO,
  booruQueryValuesSinglePostDTO,
  booruQueryValuesTagsDTO
} from '../../booru/dto/booru-queries.dto'

describe('ResponseDTO', () => {
  it('should create a valid DTO for /posts endpoint', () => {
    const examplePosts = [
      {
        id: 5,
        score: 204,
        high_res_file: {
          url: 'https://api-cdn.rule34.xxx/images/1/c57e1e1712216de1bbea44ed5d52c92eba0910bc.jpg',
          width: 600,
          height: 800
        },
        low_res_file: {
          url: 'https://api-cdn.rule34.xxx/images/1/c57e1e1712216de1bbea44ed5d52c92eba0910bc.jpg',
          width: null,
          height: null
        },
        preview_file: {
          url: 'https://api-cdn.rule34.xxx/thumbnails/1/thumbnail_c57e1e1712216de1bbea44ed5d52c92eba0910bc.jpg',
          width: null,
          height: null
        },
        tags: {
          artist: ['nakasone_haiji'],
          character: [],
          copyright: ['original'],
          general: ['11boys'],
          meta: ['bar_censor', 'censored', 'japanese_text', 'milestone', 'milestone_post', 'translated']
        },
        sources: ['https://game-porn.com/category/gangbang/'],
        rating: 'explicit',
        media_type: 'image'
      }
    ]

    const queryDto = new booruQueryValuesPostsDTO()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    queryDto.pageID = 5
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    queryDto.limit = 10

    const responseDto = ResponseDto.createFromController(
      {
        protocol: 'http',
        hostname: 'localhost',
        url: '/example'
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      queryDto,
      {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        booruType: {
          initialPageID: 0
        }
      },
      examplePosts
    )

    expect(responseDto.data).toEqual(expect.any(Array))

    expect(responseDto.meta.items_count).toBe(1)
    expect(responseDto.meta.current_page).toBe(5)
    expect(responseDto.meta.items_per_page).toBe(10)

    expect(responseDto.links.self).toBeTruthy()
    expect(responseDto.links.first).toBeTruthy()
    expect(responseDto.links.last).toBeFalsy()
    expect(responseDto.links.prev).toBeTruthy()
    expect(responseDto.links.next).toBeTruthy()
  })

  it('should create a valid DTO for /single-post endpoint', () => {
    const examplePosts = [
      {
        id: 5,
        score: 204,
        high_res_file: {
          url: 'https://api-cdn.rule34.xxx/images/1/c57e1e1712216de1bbea44ed5d52c92eba0910bc.jpg',
          width: 600,
          height: 800
        },
        low_res_file: {
          url: 'https://api-cdn.rule34.xxx/images/1/c57e1e1712216de1bbea44ed5d52c92eba0910bc.jpg',
          width: null,
          height: null
        },
        preview_file: {
          url: 'https://api-cdn.rule34.xxx/thumbnails/1/thumbnail_c57e1e1712216de1bbea44ed5d52c92eba0910bc.jpg',
          width: null,
          height: null
        },
        tags: {
          artist: ['nakasone_haiji'],
          character: [],
          copyright: ['original'],
          general: ['11boys'],
          meta: ['bar_censor', 'censored', 'japanese_text', 'milestone', 'milestone_post', 'translated']
        },
        sources: ['https://game-porn.com/category/gangbang/'],
        rating: 'explicit',
        media_type: 'image'
      }
    ]

    const queryDto = new booruQueryValuesSinglePostDTO()

    const responseDto = ResponseDto.createFromController(
      {
        protocol: 'http',
        hostname: 'localhost',
        url: '/example'
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      queryDto,
      {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        booruType: {
          initialPageID: 0
        }
      },
      examplePosts
    )

    expect(responseDto.data).toEqual(expect.any(Array))

    expect(responseDto.meta.items_count).toBe(1)
    expect(responseDto.meta.current_page).toBeFalsy()
    expect(responseDto.meta.items_per_page).toBeFalsy()

    expect(responseDto.links.self).toBeTruthy()
    expect(responseDto.links.first).toBeFalsy()
    expect(responseDto.links.last).toBeFalsy()
    expect(responseDto.links.prev).toBeFalsy()
    expect(responseDto.links.next).toBeFalsy()
  })

  it('should create a valid DTO for /tags endpoint', () => {
    const exampleTags = [
      {
        name: 'staredown',
        count: 1
      },
      {
        name: 'armored_core:_fore_answer',
        count: 1
      },
      {
        name: 'redith_leonovsky',
        count: 2
      }
    ]
    const queryDto = new booruQueryValuesTagsDTO()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    queryDto.pageID = 5
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    queryDto.limit = 3

    const responseDto = ResponseDto.createFromController(
      {
        protocol: 'http',
        hostname: 'localhost',
        url: '/example'
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      queryDto,
      {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        booruType: {
          initialPageID: 0
        }
      },
      exampleTags
    )

    expect(responseDto.data).toEqual(expect.any(Array))

    expect(responseDto.meta.items_count).toBe(3)
    expect(responseDto.meta.current_page).toBe(5)
    expect(responseDto.meta.items_per_page).toBe(3)

    expect(responseDto.links.self).toBeTruthy()
    expect(responseDto.links.first).toBeTruthy()
    expect(responseDto.links.last).toBeFalsy()
    expect(responseDto.links.prev).toBeTruthy()
    expect(responseDto.links.next).toBeTruthy()
  })
})
