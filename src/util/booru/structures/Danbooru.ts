import { Booru } from './Booru'
import { BooruClass } from 'types'

// API help page --> https://lolibooru.moe/help/api

export class Danbooru extends Booru {
  constructor(
    booruType: string,
    base: string,
    requestedEndpoints: BooruClass.BooruEndpoints,
    requestedQueryIdentifiers: BooruClass.QueryIdentifiers
  ) {
    const defaultEndpoints: BooruClass.BooruEndpoints = {
      base: base,
      posts: '/post/index.xml',
      tags: '/tag/index.xml',
      singlePost: undefined, // No known way to do this
      randomPost: '/post/index.xml',
    }

    const defaultQueryIdentifiers: BooruClass.QueryIdentifiers = {
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

    super(
      booruType,

      { ...defaultEndpoints, ...requestedEndpoints },

      { ...defaultQueryIdentifiers, ...requestedQueryIdentifiers }
    )
  }
}
