// Types
import { Booru } from '@src/types/types'

// Classes
import { GenericBooru } from './Booru'
import { GelbooruPost } from './data/Post'
import { GelbooruTag } from './data/Tag'

export class Gelbooru extends GenericBooru {
  // API help page --> https://gelbooru.com/index.php?page=wiki&s=view&id=18780
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
      posts: '/index.php?page=dapi&s=post&q=index',
      tags: '/index.php?page=dapi&s=tag&q=index',
      singlePost: '/index.php?page=dapi&s=post&q=index',
      randomPost: undefined,
    }
    const defaultQueryIdentifiers: GenericBooru['queryIdentifiers'] = {
      posts: {
        limit: 'limit',
        pageID: 'pid',
        tags: 'tags',
        rating: 'rating',
        score: 'score',
        order: 'sort',
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
  protected createPost(
    data: Booru.Structures.Data.Raw.Post
  ): Booru.Structures.Data.Processed.Post {
    return new GelbooruPost(data).toJSON()
  }

  protected createTag(
    data: Booru.Structures.Data.Raw.Tag
  ): Booru.Structures.Data.Processed.Tag {
    return new GelbooruTag(data).toJSON()
  }
}
