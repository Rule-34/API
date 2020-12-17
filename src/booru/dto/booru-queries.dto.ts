import {
  IBooruQueryValues,
  IBooruEndpoints,
  IBooruOptions,
  IBooruQueryIdentifiers,
} from '@alejandroakbal/universal-booru-wrapper'
import {
  IsFQDN,
  IsIn,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'

export class booruOptionsDTO {
  // Endpoints
  @IsFQDN()
  @IsNotEmpty()
  readonly baseEndpoint: IBooruEndpoints['base']

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly tagsEndpoint: IBooruEndpoints['tags']

  // Query Values
  // ...

  // Options
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsIn(['http', 'https'])
  readonly HTTPScheme: IBooruOptions['HTTPScheme']
}
