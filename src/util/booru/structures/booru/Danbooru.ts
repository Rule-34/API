import { Booru } from './Booru'

export class Danbooru extends Booru {
  constructor(booruType: string, base: string) {
    super(
      booruType,
      {
        base: base,
        posts: '/post/index.xml',
        tags: '/tag/index.xml',
        singlePost: undefined,
        randomPost: '/post/index.xml',
      },

      {
        posts: {
          limit: 'limit',
          pageID: 'page',
          tags: 'tags',
          rating: 'rating',
          score: 'score',
          order: 'order',
        },

        tags: {
          tag: 'name',
          limit: 'limit',
          pageID: 'page',
          order: 'order',
        },
      }
    )
  }
}
