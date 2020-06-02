export class GenericAPIError extends Error {
  public status: number
  public messageArray: Array<string>
  constructor(messageArray = ['An error has occurred'], status = 500) {
    super()

    this.messageArray = messageArray
    this.status = status

    this.name = this.constructor.name
  }
}
