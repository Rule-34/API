import { IsString } from 'class-validator'

export class BooruRequestParams {
  @IsString()
  booruType: 'gelbooru'

  @IsString()
  booruEndpoint: 'posts' | 'tags' | 'singlePost' | 'randomPost'
}
