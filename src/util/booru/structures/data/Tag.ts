// Definitions
import { Booru } from '@/types/types'

abstract class GenericBooruTag {
  rawData: Booru.Structures.Data.Raw.Tag

  name!: Booru.Structures.Data.Processed.Tag['name']
  count!: Booru.Structures.Data.Processed.Tag['count']

  constructor(fetchedTagsData: Booru.Structures.Data.Raw.Tag) {
    this.rawData = fetchedTagsData

    this.setName()
    this.setCount()
  }

  protected abstract setName(): void
  protected abstract setCount(): void

  public toJSON(): Booru.Structures.Data.Processed.Tag {
    return {
      name: this.name,
      count: this.count,
    }
  }
}

export class GelbooruTag extends GenericBooruTag {
  protected setName(): void {
    // For rule34.xxx
    // TODO: Improve this so it isnt an IF
    if (this.rawData.value) {
      this.name = this.rawData.value as string
      return
    }

    this.name = this.rawData.name as string
  }
  protected setCount(): void {
    // For rule34.xxx
    // TODO: Improve this so it isnt an IF
    if (this.rawData.label) {
      this.count = Number((this.rawData.label as string).match(/\d+/g))
      return
    }

    this.count = this.rawData.count as number
  }
}

export class Shimmie2Tag extends GenericBooruTag {
  protected setName(): void {
    this.name = (this.rawData as any)[0]
  }
  protected setCount(): void {
    this.count = (this.rawData as any)[1]
  }
}

export class DanbooruTag extends GelbooruTag {}

export class Danbooru2Tag extends GenericBooruTag {
  protected setName(): void {
    this.name = this.rawData.name as string
  }
  protected setCount(): void {
    this.count = this.rawData.post_count as number
  }
}

export class E621Tag extends Danbooru2Tag {}
