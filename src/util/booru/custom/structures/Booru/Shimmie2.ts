import { Booru } from './Booru'

export class Shimmie2 extends Booru {
  constructor(base: string) {
    super(
      {
        base: base,
        posts: '/api/danbooru/post/index.xml',
        tags: '/api/internal/autocomplete',
        singlePost: '/api/danbooru/post/index.xml',
        randomPost: undefined,
      },
      {
        limit: 'limit',
        pageID: 'pid',
        tags: 'tags',
        // rating: 'rating',
        score: 'score',
        // order: 'order',
      }
    )
  }
}
