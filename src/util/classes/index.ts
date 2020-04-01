export class CustomError extends Error {
  constructor(message: string, public status: number = 500) {
    super(message)

    // Status
    this.status = status

    this.name = this.constructor.name
  }
}
