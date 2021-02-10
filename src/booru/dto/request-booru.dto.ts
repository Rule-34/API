import { BooruTypesStringEnum } from '@alejandroakbal/universal-booru-wrapper'
import { IsDefined, IsIn, IsNotEmpty, IsString } from 'class-validator'

const BooruTypesToArray = Object.values(BooruTypesStringEnum)

export class BooruEndpointParamsDTO {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsIn(BooruTypesToArray)
  readonly booruType: BooruTypesStringEnum
}
