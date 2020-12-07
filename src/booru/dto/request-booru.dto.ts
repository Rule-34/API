import { BooruTypesStringEnum } from '@alejandroakbal/universal-booru-wrapper'
import { IsDefined, IsIn, IsNotEmpty, IsString } from 'class-validator'

export class BooruEndpointParamsDTO {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsIn(Object.values(BooruTypesStringEnum))
  readonly booruType: BooruTypesStringEnum
}
