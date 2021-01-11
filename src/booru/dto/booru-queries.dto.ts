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

export class booruPostQueriesDTO extends booruOptionsDTO {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayNotContains([''])
  @Transform((value: string) => value.trim().split(','))
  @IsOptional()
  readonly tags: IBooruQueryValues['posts']['tags']

  @IsInt()
  @Min(1)
  @Max(100)
  @Transform((value) => parseInt(value))
  @IsOptional()
  readonly limit: IBooruQueryValues['posts']['limit']
}
