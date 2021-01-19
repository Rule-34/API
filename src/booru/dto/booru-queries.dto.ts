import {
  IBooruQueryValues,
  IBooruEndpoints,
  IBooruOptions,
  IBooruQueryIdentifiers,
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
  Min,
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

abstract class booruDefaultQueryIdentifiersDTO extends booruEndpointsDTO {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly defaultQueryIdentifiersTagsTag: IBooruQueryIdentifiers['tags']['tag']

  @IsString()
  @IsOptional()
  readonly defaultQueryIdentifiersTagsTagEnding: IBooruQueryIdentifiers['tags']['tagEnding']
}

abstract class booruOptionsDTO extends booruDefaultQueryIdentifiersDTO {
  @IsString()
  @IsNotEmpty()
  @IsIn(['http', 'https'])
  @IsOptional()
  readonly httpScheme: IBooruOptions['HTTPScheme']
}

// Final class that extends all others
export abstract class booruQueriesDTO extends booruOptionsDTO {}

// ----- Classes with QueryValues ----- //
export class booruPostsQueriesDTO extends booruQueriesDTO {
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform((value) => parseInt(value))
  @IsOptional()
  readonly limit: IBooruQueryValues['posts']['limit']

  @IsInt()
  @Min(0)
  @Max(1000)
  @Transform((value) => parseInt(value))
  @IsOptional()
  readonly pageID: IBooruQueryValues['posts']['pageID']

  @IsArray()
  @ArrayNotEmpty()
  @ArrayNotContains([''])
  @Transform((value: string) => value.trim().split(','))
  @IsOptional()
  readonly tags: IBooruQueryValues['posts']['tags']

  @IsString()
  @IsNotEmpty()
  @IsIn(['safe', 'questionable', 'explicit'])
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

export class booruRandomPostsQueriesDTO extends booruPostsQueriesDTO {}

export class booruSinglePostQueriesDTO extends booruQueriesDTO {
  @IsInt()
  @Min(0)
  @Max(99999)
  @Transform((value) => parseInt(value))
  @IsOptional()
  readonly id: IBooruQueryValues['singlePost']['id']
}

export class booruTagsQueriesDTO extends booruQueriesDTO {
  @IsString()
  @IsNotEmpty()
  readonly tag: IBooruQueryValues['tags']['tag']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly tagEnding: IBooruQueryValues['tags']['tagEnding']

  @IsInt()
  @Min(1)
  @Max(100)
  @Transform((value) => parseInt(value))
  @IsOptional()
  readonly limit: IBooruQueryValues['tags']['limit']

  @IsInt()
  @Min(0)
  @Max(1000)
  @Transform((value) => parseInt(value))
  @IsOptional()
  readonly pageID: IBooruQueryValues['tags']['pageID']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly order: IBooruQueryValues['tags']['order']
}
