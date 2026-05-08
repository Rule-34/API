import { UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppController } from './app.controller'
import { BooruAuthManagerService } from './booru/services/booru-auth-manager.service'

describe('AppController', () => {
  let controller: AppController
  let mockConfigService: Pick<ConfigService, 'get'>
  let mockAuthManager: Pick<BooruAuthManagerService, 'getCredentialPoolStatus'>

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn()
    }

    mockAuthManager = {
      getCredentialPoolStatus: jest.fn()
    }

    controller = new AppController(mockConfigService as ConfigService, mockAuthManager as BooruAuthManagerService)
  })

  it('should return OK status on root endpoint', () => {
    expect(controller.GetStatusAsJson()).toEqual({ status: 'OK' })
  })

  it('should reject internal credential status endpoint when token is invalid', () => {
    ;(mockConfigService.get as jest.Mock).mockReturnValue('expected-token')

    expect(() => controller.GetBooruCredentialStatus('wrong-token', 'gelbooru.com')).toThrow(
      UnauthorizedException
    )
    expect(mockAuthManager.getCredentialPoolStatus).not.toHaveBeenCalled()
  })

  it('should return credential status snapshots when token is valid', () => {
    const snapshot = [{ domain: 'gelbooru.com', total: 1 }]

    ;(mockConfigService.get as jest.Mock).mockReturnValue('expected-token')
    ;(mockAuthManager.getCredentialPoolStatus as jest.Mock).mockReturnValue(snapshot)

    const result = controller.GetBooruCredentialStatus('expected-token', 'gelbooru.com')

    expect(result).toEqual({
      status: 'OK',
      data: snapshot
    })
    expect(mockAuthManager.getCredentialPoolStatus).toHaveBeenCalledWith('gelbooru.com')
  })
})
