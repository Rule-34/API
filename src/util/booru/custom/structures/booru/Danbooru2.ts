import { Booru } from './Booru'

export class Danbooru2 extends Booru {
  constructor(base: string) {
    super(
      {
        base: base,
        posts: '/posts.json',
        tags: '/tags.json',
        singlePost: '/posts/',
        randomPost: '/posts.json',
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
          tag: 'search[name_matches]',
          tagEnding: '*',
          limit: 'limit',
          pageID: 'page',
          order: 'search[order]',
          raw: undefined,
        },
      }
    )
  }
}
