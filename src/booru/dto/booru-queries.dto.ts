import {
  IBooruQueryValues,
  IBooruEndpoints,
  IBooruOptions,
  IBooruQueryIdentifiers
} from '@alejandroakbal/universal-booru-wrapper'
import {
  ArrayNotContains,
  ArrayNotEmpty,
  IsArray,
  IsFQDN,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min
} from 'class-validator'
import { Transform } from 'class-transformer'

type PostsQueryIdentifiers = NonNullable<IBooruQueryIdentifiers['posts']>
type RandomPostsQueryIdentifiers = NonNullable<IBooruQueryIdentifiers['randomPosts']>
type SinglePostQueryIdentifiers = NonNullable<IBooruQueryIdentifiers['singlePost']>
type TagsQueryIdentifiers = NonNullable<IBooruQueryIdentifiers['tags']>
type PostsQueryValues = NonNullable<IBooruQueryValues['posts']>
type SinglePostQueryValues = NonNullable<IBooruQueryValues['singlePost']>
type TagsQueryValues = NonNullable<IBooruQueryValues['tags']>

function parseIntegerQueryValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return Number.parseInt(value, 10)
  }

  return value
}

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

function transformTagsQueryValue(value: unknown): unknown {
  if (value === undefined || value === null) {
    return value
  }

  const values = isUnknownArray(value) ? value : [value]

  return values.flatMap((tag) => (typeof tag === 'string' ? tag.trim().split('|') : [tag]))
}

abstract class booruEndpointsDTO {
  @IsFQDN()
  @IsNotEmpty()
  @IsOptional()
  readonly baseEndpoint?: IBooruEndpoints['base']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly postsEndpoint?: IBooruEndpoints['posts']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly randomPostsEndpoint?: IBooruEndpoints['randomPosts']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly singlePostEndpoint?: IBooruEndpoints['singlePost']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly tagsEndpoint?: IBooruEndpoints['tags']
}

abstract class booruOptionsDTO extends booruEndpointsDTO {
  @IsString()
  @IsNotEmpty()
  @IsIn(['http', 'https'])
  @IsOptional()
  readonly httpScheme?: IBooruOptions['HTTPScheme']
}

abstract class booruDefaultQueryIdentifiersPostsDTO extends booruOptionsDTO {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersPostsLimit?: PostsQueryIdentifiers['limit']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersPostsPageID?: PostsQueryIdentifiers['pageID']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersPostsTags?: PostsQueryIdentifiers['tags']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersPostsRating?: PostsQueryIdentifiers['rating']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersPostsScore?: PostsQueryIdentifiers['score']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersPostsOrder?: PostsQueryIdentifiers['order']
}
abstract class booruDefaultQueryIdentifiersRandomPostsDTO extends booruDefaultQueryIdentifiersPostsDTO {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersRandomPostsLimit?: RandomPostsQueryIdentifiers['limit']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersRandomPostsPageID?: RandomPostsQueryIdentifiers['pageID']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersRandomPostsTags?: RandomPostsQueryIdentifiers['tags']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersRandomPostsRating?: RandomPostsQueryIdentifiers['rating']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersRandomPostsScore?: RandomPostsQueryIdentifiers['score']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersRandomPostsOrder?: RandomPostsQueryIdentifiers['order']
}
abstract class booruDefaultQueryIdentifiersSinglePostDTO extends booruDefaultQueryIdentifiersRandomPostsDTO {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersSinglePostID?: SinglePostQueryIdentifiers['id']
}

abstract class booruDefaultQueryIdentifiersTagsDTO extends booruDefaultQueryIdentifiersSinglePostDTO {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersTagsTag?: TagsQueryIdentifiers['tag']

  @IsString()
  @IsOptional()
  readonly defaultQueryIdentifiersTagsTagEnding?: TagsQueryIdentifiers['tagEnding']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersTagsLimit?: TagsQueryIdentifiers['limit']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersTagsPageID?: TagsQueryIdentifiers['pageID']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersTagsOrder?: TagsQueryIdentifiers['order']
}

/**
 * Final class that extends all others
 */
export abstract class booruQueriesDTO extends booruDefaultQueryIdentifiersTagsDTO {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly auth_user?: string

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly auth_pass?: string
}

// ----- Classes with QueryValues ----- //
export class booruQueryValuesPostsDTO extends booruQueriesDTO {
  @IsInt()
  @Min(1)
  @Transform(({ value }: { value: unknown }) => parseIntegerQueryValue(value))
  @IsOptional()
  readonly limit?: PostsQueryValues['limit']

  @IsInt()
  @Min(0)
  @Transform(({ value }: { value: unknown }) => parseIntegerQueryValue(value))
  @IsOptional()
  readonly pageID?: PostsQueryValues['pageID']

  @IsArray()
  @ArrayNotEmpty()
  @ArrayNotContains([''])
  @IsString({ each: true })
  @Transform(({ value }: { value: unknown }) => transformTagsQueryValue(value))
  @IsOptional()
  readonly tags?: PostsQueryValues['tags']

  @IsString()
  @IsNotEmpty()
  @IsIn(['safe', 'general', 'sensitive', 'questionable', 'explicit'])
  @IsOptional()
  readonly rating?: PostsQueryValues['rating']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly score?: PostsQueryValues['score']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly order?: PostsQueryValues['order']
}

// Same as PostsQueries since they are practically the same
export class booruQueryValuesRandomPostsDTO extends booruQueryValuesPostsDTO {}

export class booruQueryValuesSinglePostDTO extends booruQueriesDTO {
  @IsInt()
  @Min(0)
  @Max(99999)
  @Transform(({ value }: { value: unknown }) => parseIntegerQueryValue(value))
  @IsOptional()
  readonly ID?: SinglePostQueryValues['id']
}

export class booruQueryValuesTagsDTO extends booruQueriesDTO {
  @IsString()
  @IsNotEmpty()
  readonly tag!: TagsQueryValues['tag']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly tagEnding?: TagsQueryValues['tagEnding']

  @IsInt()
  @Min(1)
  @Transform(({ value }: { value: unknown }) => parseIntegerQueryValue(value))
  @IsOptional()
  readonly limit?: TagsQueryValues['limit']

  @IsInt()
  @Min(0)
  @Transform(({ value }: { value: unknown }) => parseIntegerQueryValue(value))
  @IsOptional()
  readonly pageID?: TagsQueryValues['pageID']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly order?: TagsQueryValues['order']
}
