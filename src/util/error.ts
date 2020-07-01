export class GenericAPIError extends Error {
  public status: number
  public messageArray: Array<string>
  constructor(
    message = 'An error has occurred',
    messageArray?: Array<string>,
    status?: number
  ) {
    super(message)

    this.messageArray = messageArray as string[]
    this.status = status as number

    this.name = this.constructor.name
  }
}
