import { Booru } from './Booru'

export class Danbooru extends Booru {
  constructor(base: string) {
    super(
      {
        base: base,
        posts: '/post/index.xml',
        tags: '/tag/index.xml',
        singlePost: undefined,
        randomPost: '/post/index.xml',
      },
      {
        limit: 'limit',
        pageID: 'page',
        tags: 'tags',
        rating: 'rating',
        score: 'score',
        order: 'order',
      }
    )
  }
}
