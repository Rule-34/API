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

abstract class booruOptionsDTO {
  @IsFQDN()
  @IsNotEmpty()
  readonly baseEndpoint: IBooruEndpoints['base']

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly tagsEndpoint: IBooruEndpoints['tags']

  @IsString()
  @IsNotEmpty()
  @IsIn(['http', 'https'])
  @IsOptional()
  readonly HTTPScheme: IBooruOptions['HTTPScheme']
}

export class booruPostsQueriesDTO extends booruOptionsDTO {
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

export class booruSinglePostQueriesDTO extends booruOptionsDTO {
  @IsInt()
  @Min(0)
  @Max(99999)
  @Transform((value) => parseInt(value))
  @IsOptional()
  readonly id: IBooruQueryValues['singlePost']['id']
}
