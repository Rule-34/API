import { Booru } from './Booru'

export class Danbooru extends Booru {
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
