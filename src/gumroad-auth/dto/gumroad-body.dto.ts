import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'
import { Transform } from 'class-transformer'

export class GumroadBodyDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(20)
  readonly product_permalink: string

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  readonly license_key: string

  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  @Transform(({ value }) => {
    switch (value) {
      case 'true':
        return true

      case 'false':
        return false

      default:
        return true
    }
  })
  readonly increment_uses_count: boolean
}
