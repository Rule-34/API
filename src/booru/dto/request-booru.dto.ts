import { IsDefined, IsIn, IsNotEmpty, IsString } from 'class-validator'

export class BooruEndpointParamsDTO {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsIn(['gelbooru'])
  readonly booruType: string

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsIn(['posts', 'tags', 'singlePost', 'randomPost'])
  readonly booruEndpoint: string
}
