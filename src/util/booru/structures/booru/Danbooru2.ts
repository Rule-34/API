import { Booru } from './Booru'

export class Danbooru2 extends Booru {
  constructor(booruType: string, base: string) {
    super(
      booruType,
      {
        base: base,
        posts: '/posts.json',
        tags: '/tags.json',
        singlePost: '/posts/%.json',
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

        singlePost: {
          id: undefined,
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
