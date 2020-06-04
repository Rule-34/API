// Types
import { Booru } from '@/types/types'

// Classes
import { GenericBooru } from './Booru'
import { DanbooruPost } from './data/Post'
import { DanbooruTag } from './data/Tag'

export class Danbooru extends GenericBooru {
  // API help page --> https://lolibooru.moe/help/api
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
      posts: '/post/index.xml',
      tags: '/tag/index.xml',
      singlePost: undefined,
      randomPost: '/post/index.xml',
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

  protected createPost(
    data: Booru.Structures.Data.Raw.Post
  ): Booru.Structures.Data.Processed.Post {
    return new DanbooruPost(data).toJSON()
  }

  protected createTag(
    data: Booru.Structures.Data.Raw.Tag
  ): Booru.Structures.Data.Processed.Tag {
    return new DanbooruTag(data).toJSON()
  }
}
