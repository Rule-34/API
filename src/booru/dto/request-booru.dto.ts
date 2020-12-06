import { IsDefined, IsIn, IsNotEmpty, IsString } from 'class-validator'
import { BooruTypes } from '../types/BooruTypes'

export class BooruEndpointParamsDTO {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsIn(Object.values(BooruTypes))
  readonly booruType: BooruTypes
}
