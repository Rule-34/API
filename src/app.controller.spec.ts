import { AppController } from './app.controller'
import { BooruAuthManagerService } from './booru/services/booru-auth-manager.service'

describe('AppController', () => {
  let controller: AppController
  let mockAuthManager: Pick<BooruAuthManagerService, 'getCredentialPoolStatus'>

  beforeEach(() => {
    mockAuthManager = {
      getCredentialPoolStatus: jest.fn()
    }

    controller = new AppController(mockAuthManager as BooruAuthManagerService)
  })

  it('should return OK status on root endpoint', () => {
    expect(controller.GetStatusAsJson()).toEqual({ status: 'OK' })
  })

  it('should return credential status snapshots', () => {
    const snapshot = [{ domain: 'gelbooru.com', total: 1 }]

    ;(mockAuthManager.getCredentialPoolStatus as jest.Mock).mockReturnValue(snapshot)

    const result = controller.getBooruCredentialStatus()

    expect(result).toEqual({
      status: 'OK',
      data: snapshot
    })
    expect(mockAuthManager.getCredentialPoolStatus).toHaveBeenCalledWith()
  })

  it('should return OK with empty array data', () => {
    ;(mockAuthManager.getCredentialPoolStatus as jest.Mock).mockReturnValue([])

    const result = controller.getBooruCredentialStatus()

    expect(result).toEqual({
      status: 'OK',
      data: []
    })
  })

  it('should return OK when service returns undefined', () => {
    ;(mockAuthManager.getCredentialPoolStatus as jest.Mock).mockReturnValue(undefined)

    const result = controller.getBooruCredentialStatus()

    expect(result).toEqual({
      status: 'OK',
      data: undefined
    })
  })

  it('should return OK when service returns null', () => {
    ;(mockAuthManager.getCredentialPoolStatus as jest.Mock).mockReturnValue(null)

    const result = controller.getBooruCredentialStatus()

    expect(result).toEqual({
      status: 'OK',
      data: null
    })
  })

  it('should return OK with multiple status entries', () => {
    const snapshot = [
      { domain: 'gelbooru.com', total: 1 },
      { domain: 'rule34.xxx', total: 8 }
    ]
    ;(mockAuthManager.getCredentialPoolStatus as jest.Mock).mockReturnValue(snapshot)

    const result = controller.getBooruCredentialStatus()

    expect(result).toEqual({
      status: 'OK',
      data: snapshot
    })
  })

  it('should rethrow service errors from status lookup', () => {
    const expectedError = new Error('status lookup failed')
    ;(mockAuthManager.getCredentialPoolStatus as jest.Mock).mockImplementation(() => {
      throw expectedError
    })

    expect(() => controller.getBooruCredentialStatus()).toThrow(expectedError)
  })
})
