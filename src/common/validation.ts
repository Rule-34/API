import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common'

export const APP_VALIDATION_PIPE_OPTIONS: ValidationPipeOptions = {
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true
}

export function createAppValidationPipe() {
  return new ValidationPipe(APP_VALIDATION_PIPE_OPTIONS)
}
