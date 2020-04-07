export class CustomError extends Error {
  constructor(
    message = 'An error has ocurred',
    public status: number = 500,
    public messageArray?: Array<object>
  ) {
    super(message)

    this.name = this.constructor.name
  }
}
