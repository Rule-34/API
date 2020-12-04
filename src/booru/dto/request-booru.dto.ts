import { IsString } from 'class-validator'

export class BooruEndpointParamsDTO {
  @IsString()
  booruType: 'gelbooru'

  @IsString()
  booruEndpoint: 'posts' | 'tags' | 'singlePost' | 'randomPost'
}
