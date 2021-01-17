import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'

export class GumroadBodyDTO {
  @IsString()
  @IsNotEmpty()
  @Min(1)
  @Max(10)
  readonly product_permalink: string

  @IsString()
  @IsNotEmpty()
  @Min(1)
  @Max(30)
  readonly license_key: string

  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  readonly increment_uses_count: boolean = true
}
