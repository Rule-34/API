import { Booru } from './Booru'

export class Gelbooru extends Booru {
  constructor(booruType: string, base: string) {
    super(
      booruType,
      {
        base: base,
        posts: '/index.php?page=dapi&s=post&q=index',
        tags: '/index.php?page=dapi&s=tag&q=index',
        singlePost: '/index.php?page=dapi&s=post&q=index',
        randomPost: undefined, // Only works for gelbooru.com
      },

      {
        posts: {
          limit: 'limit',
          pageID: 'pid',
          tags: 'tags',
          rating: 'rating',
          score: 'score',
          order: 'sort', // Only works for gelbooru.com
        },

        singlePost: {
          id: 'id',
        },

        tags: {
          tag: 'name_pattern',
          tagEnding: '%',
          limit: 'limit',
          pageID: undefined,
          order: 'orderby',
          raw: undefined,
        },
      }
    )
  }
}
