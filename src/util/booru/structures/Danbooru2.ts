import { Booru } from './Booru'
import { BooruClass } from 'types'

// API help page --> https://danbooru.donmai.us/wiki_pages/help:api

export class Danbooru2 extends Booru {
  constructor(
    booruType: string,
    base: string,
    requestedEndpoints: BooruClass.BooruEndpoints,
    requestedQueryIdentifiers: BooruClass.QueryIdentifiers
  ) {
    const defaultEndpoints: BooruClass.BooruEndpoints = {
      base: base,
      posts: '/posts.json',
      tags: '/tags.json',
      singlePost: '/posts/%.json',
      randomPost: '/posts.json',
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
        id: undefined, // Not necessary
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

    super(
      booruType,

      { ...defaultEndpoints, ...requestedEndpoints },

      { ...defaultQueryIdentifiers, ...requestedQueryIdentifiers }
    )
  }
}
