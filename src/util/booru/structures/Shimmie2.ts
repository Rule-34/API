// Types
import { Booru } from '@/types/types'

// Utilities
import { EmptyDataError } from '@/util/classes'

// Classes
import { GenericBooru } from './Booru'
import { Shimmie2Post } from './data/Post'
import { Shimmie2Tag } from './data/Tag'

export class Shimmie2 extends GenericBooru {
  // API help page --> It has no documentation at all
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
      posts: '/api/danbooru/find_posts',
      tags: '/api/internal/autocomplete',
      singlePost: '/api/danbooru/post/index.xml',
      randomPost: undefined,
    }
    const defaultQueryIdentifiers: GenericBooru['queryIdentifiers'] = {
      posts: {
        limit: 'limit',
        pageID: 'pid',
        tags: 'tags',
        rating: undefined,
        score: undefined,
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

  protected createPost(
    data: Booru.Structures.Data.Raw.Post
  ): Booru.Structures.Data.Processed.Post {
    return new Shimmie2Post(data).toJSON()
  }

  protected createTag(
    data: Booru.Structures.Data.Raw.Tag
  ): Booru.Structures.Data.Processed.Tag {
    return new Shimmie2Tag(data).toJSON()
  }

  protected createTagArray(
    data: any,
    queries: Booru.Structures.Requests.Queries.Tags
  ): Booru.Structures.Data.Processed.Tag[] {
    const Tags: Booru.Structures.Data.Processed.Tag[] = []

    let counter = 0
    for (const prop of Object.entries(data)) {
      counter++

      Tags.push(this.createTag(prop as any))

      if (counter >= (queries.limit as number)) break
    }

    return Tags
  }

  protected checkForEmptyTagsData(data: any[]): void {
    if (!Object.keys(data).length) throw new EmptyDataError()
  }
}
