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
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'
import { Transform } from 'class-transformer'

abstract class booruOptionsDTO {
  // Endpoints
  @IsFQDN()
  @IsNotEmpty()
  readonly baseEndpoint: IBooruEndpoints['base']

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly tagsEndpoint: IBooruEndpoints['tags']

  // Options
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsIn(['http', 'https'])
  readonly HTTPScheme: IBooruOptions['HTTPScheme']
}

export class booruPostQueriesDTO extends booruOptionsDTO {
  // Query Identifiers
  // @IsOptional()
  // @IsJSON()
  // @IsNotEmpty()
  // readonly tagsQueryIdentifiers: IBooruQueryIdentifiers['tags']

  // Query Values
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayNotContains([''])
  @Transform((tagsString: string) => tagsString.trim().split(','))
  readonly tags: IBooruQueryValues['posts']['tags']
}
