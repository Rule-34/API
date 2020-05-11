import { Booru } from './Booru'

export class Gelbooru extends Booru {
  constructor(base: string) {
    super(
      {
        base: base,
        posts: '/index.php?page=dapi&s=post&q=index',
        tags: '/autocomplete.php',
        singlePost: '/index.php?page=dapi&s=post&q=index',
        randomPost: undefined,
      },
      {
        limit: 'limit',
        pageID: 'pid',
        tags: 'tags',
        rating: 'rating',
        score: 'score',
        order: 'order',
      }
    )
  }
}
