// Types
import { Booru } from '@src/types/types'

// Classes
import { GenericBooru } from './Booru'
import { Danbooru2Post } from './data/Post'
import { Danbooru2Tag } from './data/Tag'

export class Danbooru2 extends GenericBooru {
  // API help page --> https://danbooru.donmai.us/wiki_pages/help:api
  constructor(
    base: string,
    booruType: GenericBooru['booruType'],
    {
      requestedEndpoints,
      requestedQueryIdentifiers,
    }: {
      requestedEndpoints: GenericBooru['endpoints']
      requestedQueryIdentifiers: GenericBooru['queryIdentifiers']
    }
  ) {
    const defaultEndpoints: GenericBooru['endpoints'] = {
      base: base,
      posts: '/posts.json',
      tags: '/tags.json',
      singlePost: '/posts/%.json',
      randomPost: '/posts.json',
    }
    const defaultQueryIdentifiers: GenericBooru['queryIdentifiers'] = {
      posts: {
        limit: 'limit',
        pageID: 'page',
        tags: 'tags',
        rating: 'rating',
        score: 'score',
        order: 'order',
      },
      singlePost: {
        id: undefined,
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

  protected customFetchAndParseDataModification(data: any): any {
    if (!Array.isArray(data)) data = [data]

    return data
  }

  protected createPost(
    data: Booru.Structures.Data.Raw.Post
  ): Booru.Structures.Data.Processed.Post {
    return new Danbooru2Post(data).toJSON()
  }

  protected createTag(
    data: Booru.Structures.Data.Raw.Tag
  ): Booru.Structures.Data.Processed.Tag {
    return new Danbooru2Tag(data).toJSON()
  }

  protected addSinglePostQueries(
    URL: string,
    queries: Booru.Structures.Requests.Queries.SinglePost
  ): string {
    const { id } = queries

    // Unique to this booru
    URL = URL.replace('%', (id as unknown) as string)

    return URL
  }
}
