import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'
import { Transform } from 'class-transformer'
import { GumroadRequest } from '../interfaces/gumroad.interface'

export class GumroadBodyDTO {
  // @IsString()
  // @IsNotEmpty()
  // @MinLength(1)
  // @MaxLength(20)
  // readonly product_permalink: GumroadRequest['product_permalink']

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  readonly license_key: GumroadRequest['license_key']

  // @IsBoolean()
  // @IsNotEmpty()
  // @IsOptional()
  // @Transform(({ value }) => {
  //   switch (value) {
  //     case 'true':
  //       return true

  //     case 'false':
  //       return false

  //     default:
  //       return true
  //   }
  // })
  // readonly increment_uses_count: GumroadRequest['increment_uses_count']
}
