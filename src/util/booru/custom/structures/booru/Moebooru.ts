import { Booru } from './Booru'

export class Moebooru extends Booru {
  constructor(base: string) {
    super(
      {
        base: base,
        posts: '/post.xml',
        tags: '/tag.xml',
        singlePost: undefined,
        randomPost: '/post.xml',
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
