import { Booru } from './Booru'

export class Danbooru extends Booru {
  constructor(booruType: string, base: string) {
    super(
      booruType,
      {
        base: base,
        posts: '/post/index.xml',
        tags: '/tag/index.xml',
        singlePost: undefined, // No known way to do this
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

        singlePost: {
          id: undefined, // No known way to do this
        },

        tags: {
          tag: 'name',
          tagEnding: undefined,
          limit: 'limit',
          pageID: 'page',
          order: 'order',
          raw: undefined,
        },
      }
    )
  }
}
