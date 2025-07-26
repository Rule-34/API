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

abstract class booruEndpointsDTO {
  @IsFQDN()
  @IsNotEmpty()
  readonly baseEndpoint: IBooruEndpoints['base']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly postsEndpoint: IBooruEndpoints['posts']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly randomPostsEndpoint: IBooruEndpoints['randomPosts']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly singlePostEndpoint: IBooruEndpoints['singlePost']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly tagsEndpoint: IBooruEndpoints['tags']
}

abstract class booruOptionsDTO extends booruEndpointsDTO {
  @IsString()
  @IsNotEmpty()
  @IsIn(['http', 'https'])
  @IsOptional()
  readonly httpScheme: IBooruOptions['HTTPScheme']
}

abstract class booruDefaultQueryIdentifiersPostsDTO extends booruOptionsDTO {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersPostsLimit: IBooruQueryIdentifiers['posts']['limit']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersPostsPageID: IBooruQueryIdentifiers['posts']['pageID']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersPostsTags: IBooruQueryIdentifiers['posts']['tags']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersPostsRating: IBooruQueryIdentifiers['posts']['rating']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersPostsScore: IBooruQueryIdentifiers['posts']['score']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersPostsOrder: IBooruQueryIdentifiers['posts']['order']
}
abstract class booruDefaultQueryIdentifiersRandomPostsDTO extends booruDefaultQueryIdentifiersPostsDTO {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersRandomPostsLimit: IBooruQueryIdentifiers['randomPosts']['limit']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersRandomPostsPageID: IBooruQueryIdentifiers['randomPosts']['pageID']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersRandomPostsTags: IBooruQueryIdentifiers['randomPosts']['tags']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersRandomPostsRating: IBooruQueryIdentifiers['randomPosts']['rating']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersRandomPostsScore: IBooruQueryIdentifiers['randomPosts']['score']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersRandomPostsOrder: IBooruQueryIdentifiers['randomPosts']['order']
}
abstract class booruDefaultQueryIdentifiersSinglePostDTO extends booruDefaultQueryIdentifiersRandomPostsDTO {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersSinglePostID: IBooruQueryIdentifiers['singlePost']['id']
}

abstract class booruDefaultQueryIdentifiersTagsDTO extends booruDefaultQueryIdentifiersSinglePostDTO {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersTagsTag: IBooruQueryIdentifiers['tags']['tag']

  @IsString()
  @IsOptional()
  readonly defaultQueryIdentifiersTagsTagEnding: IBooruQueryIdentifiers['tags']['tagEnding']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersTagsLimit: IBooruQueryIdentifiers['tags']['limit']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersTagsPageID: IBooruQueryIdentifiers['tags']['pageID']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersTagsOrder: IBooruQueryIdentifiers['tags']['order']
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
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  readonly limit: IBooruQueryValues['posts']['limit']

  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  readonly pageID: IBooruQueryValues['posts']['pageID']

  @IsArray()
  @ArrayNotEmpty()
  @ArrayNotContains([''])
  @Transform(({ value }) => value.trim().split('|'))
  @IsOptional()
  readonly tags: IBooruQueryValues['posts']['tags']

  @IsString()
  @IsNotEmpty()
  @IsIn(['safe', 'general', 'sensitive', 'questionable', 'explicit'])
  @IsOptional()
  readonly rating: IBooruQueryValues['posts']['rating']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly score: IBooruQueryValues['posts']['score']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly order: IBooruQueryValues['posts']['order']
}

// Same as PostsQueries since they are practically the same
export class booruQueryValuesRandomPostsDTO extends booruQueryValuesPostsDTO {}

export class booruQueryValuesSinglePostDTO extends booruQueriesDTO {
  @IsInt()
  @Min(0)
  @Max(99999)
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  readonly ID: IBooruQueryValues['singlePost']['id']
}

export class booruQueryValuesTagsDTO extends booruQueriesDTO {
  @IsString()
  @IsNotEmpty()
  readonly tag: IBooruQueryValues['tags']['tag']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly tagEnding: IBooruQueryValues['tags']['tagEnding']

  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  readonly limit: IBooruQueryValues['tags']['limit']

  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  readonly pageID: IBooruQueryValues['tags']['pageID']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly order: IBooruQueryValues['tags']['order']
}
