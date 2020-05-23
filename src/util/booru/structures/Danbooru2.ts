import { GenericBooru } from './Booru'
import { Booru } from 'types'

// API help page --> https://danbooru.donmai.us/wiki_pages/help:api

export class Danbooru2 extends GenericBooru {
  constructor(
    booruType: string,
    base: string,
    requestedEndpoints: Booru.Classes.GenericBooru.Endpoints,
    requestedQueryIdentifiers: Booru.Classes.GenericBooru.QueryIdentifiers
  ) {
    const defaultEndpoints: Booru.Classes.GenericBooru.Endpoints = {
      base: base,
      posts: '/posts.json',
      tags: '/tags.json',
      singlePost: '/posts/%.json',
      randomPost: '/posts.json',
    }

    const defaultQueryIdentifiers: Booru.Classes.GenericBooru.QueryIdentifiers = {
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
