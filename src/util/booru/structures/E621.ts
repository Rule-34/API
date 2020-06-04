// Types
import { Booru } from '@/types/types'

// Classes
import { Danbooru2 } from './Danbooru2'
import { E621Post } from './data/Post'
import { E621Tag } from './data/Tag'

export class E621 extends Danbooru2 {
  // API help page --> https://e621.net/help/api
  protected createPost(
    data: Booru.Structures.Data.Raw.Post
  ): Booru.Structures.Data.Processed.Post {
    return new E621Post(data).toJSON()
  }

  protected createTag(
    data: Booru.Structures.Data.Raw.Tag
  ): Booru.Structures.Data.Processed.Tag {
    return new E621Tag(data).toJSON()
  }

  protected customFetchAndParseDataModification(data: any): any {
    if (data.posts) data = data.posts
    else if (data.post) data = data.post

    if (!Array.isArray(data)) data = [data]

    return data
  }
}
