import { GenericBooru } from './Booru'
import { Booru } from 'types'

// API help page --> It has no documentation at all

export class Shimmie2 extends GenericBooru {
  constructor(
    booruType: string,
    base: string,
    requestedEndpoints: Booru.Classes.GenericBooru.Endpoints,
    requestedQueryIdentifiers: Booru.Classes.GenericBooru.QueryIdentifiers
  ) {
    const defaultEndpoints: Booru.Classes.GenericBooru.Endpoints = {
      base: base,
      posts: '/api/danbooru/find_posts',
      tags: '/api/internal/autocomplete', // the /api/danbooru/find_tags is the absolute worth thing
      singlePost: '/api/danbooru/post/index.xml',
      randomPost: undefined,
    }

    const defaultQueryIdentifiers: Booru.Classes.GenericBooru.QueryIdentifiers = {
      posts: {
        limit: 'limit',
        pageID: 'pid',
        tags: 'tags',
        rating: undefined,
        score: 'score',
        order: undefined,
      },

      singlePost: {
        id: 'id',
      },

      tags: {
        tag: 's',
        tagEnding: undefined,
        limit: undefined,
        pageID: undefined,
        order: undefined,
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
