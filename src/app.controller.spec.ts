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

    const result = controller.GetBooruCredentialStatus('gelbooru.com')

    expect(result).toEqual({
      status: 'OK',
      data: snapshot
    })
    expect(mockAuthManager.getCredentialPoolStatus).toHaveBeenCalledWith('gelbooru.com')
  })
})
