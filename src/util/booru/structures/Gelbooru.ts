import { Booru } from './Booru'
import { BooruClass } from 'types'

// API help page --> https://gelbooru.com/index.php?page=wiki&s=view&id=18780

export class Gelbooru extends Booru {
  constructor(
    booruType: string,
    base: string,
    requestedEndpoints: BooruClass.BooruEndpoints,
    requestedQueryIdentifiers: BooruClass.QueryIdentifiers
  ) {
    const defaultEndpoints: BooruClass.BooruEndpoints = {
      base: base,
      posts: '/index.php?page=dapi&s=post&q=index',
      tags: '/index.php?page=dapi&s=tag&q=index',
      singlePost: '/index.php?page=dapi&s=post&q=index',
      randomPost: undefined, // Only works for gelbooru.com
    }

    const defaultQueryIdentifiers: BooruClass.QueryIdentifiers = {
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

    super(
      booruType,

      { ...defaultEndpoints, ...requestedEndpoints },

      { ...defaultQueryIdentifiers, ...requestedQueryIdentifiers }
    )
  }
}
