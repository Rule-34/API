import { BooruTypesStringEnum } from '@alejandroakbal/universal-booru-wrapper'
import { IsDefined, IsIn, IsNotEmpty, IsString } from 'class-validator'

const AdditionalBooruTypes = ['kemono'] as const

export type SupportedBooruType = BooruTypesStringEnum | (typeof AdditionalBooruTypes)[number]

const BooruTypesToArray = [...Object.values(BooruTypesStringEnum), ...AdditionalBooruTypes]

export class BooruEndpointParamsDTO {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsIn(BooruTypesToArray)
  readonly booruType: SupportedBooruType
}
