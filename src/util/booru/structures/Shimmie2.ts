import { Booru } from './Booru'

export class Shimmie2 extends Booru {
  constructor(booruType: string, base: string) {
    super(
      booruType,
      {
        base: base,
        posts: '/api/danbooru/find_posts',
        tags: '/api/internal/autocomplete', // the /api/danbooru/find_tags is the absolute worth thing
        singlePost: '/api/danbooru/post/index.xml',
        randomPost: undefined,
      },

      {
        posts: {
          limit: 'limit',
          pageID: 'pid',
          tags: 'tags',
          // rating: 'rating',
          score: 'score',
          // order: 'order',
        },

        singlePost: {
          id: 'id',
        },

        tags: {
          tag: 's',
          limit: undefined,
          pageID: undefined,
          order: undefined,
        },
      }
    )
  }
}
