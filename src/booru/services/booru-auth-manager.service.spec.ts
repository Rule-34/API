import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { BooruAuthManagerService } from './booru-auth-manager.service'

describe('BooruAuthManagerService', () => {
  let service: BooruAuthManagerService

  beforeEach(async () => {
    const configServiceMock = {
      get: jest.fn((key: string) => {
        if (key !== 'BOORU_AUTH_CONFIG') {
          return undefined
        }

        return JSON.stringify({
          'rule34.xxx': [{ user: 'canonical-user', password: 'canonical-pass' }],
          'api.rule34.xxx': [
            { user: 'canonical-user', password: 'canonical-pass' },
            { user: 'api-user', password: 'api-pass' }
          ],
          'gelbooru.com': [{ user: 'gel-user', password: 'gel-pass' }],
          'www.gelbooru.com': [{ user: 'www-gel-user', password: 'www-gel-pass' }]
        })
      })
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooruAuthManagerService,
        {
          provide: ConfigService,
          useValue: configServiceMock
        }
      ]
    }).compile()

    service = module.get<BooruAuthManagerService>(BooruAuthManagerService)
    service.onModuleInit()
  })

  it('should normalize rule34 aliases into canonical deduplicated domain config', () => {
    const stats = service.getCredentialStats()
    const rule34Stats = stats.find((stat) => stat.domain === 'rule34.xxx')

    expect(rule34Stats).toEqual({
      domain: 'rule34.xxx',
      total: 2,
      available: 2,
      disabled: 0
    })
  })

  it('should keep non-aliased www domains separate from root domains', () => {
    const rootCredential = service.getAvailableCredential('https://gelbooru.com/index.php?page=dapi')
    const wwwCredential = service.getAvailableCredential('https://www.gelbooru.com/index.php?page=dapi')

    expect(rootCredential).toEqual({ user: 'gel-user', password: 'gel-pass' })
    expect(wwwCredential).toEqual({ user: 'www-gel-user', password: 'www-gel-pass' })
  })

  it('should resolve credentials for api.rule34.xxx using rule34.xxx auth pool', () => {
    const credential = service.getAvailableCredential('https://api.rule34.xxx/index.php?page=dapi')

    expect(credential).not.toBeNull()
    expect(['canonical-user', 'api-user']).toContain(credential!.user)
  })

  it('should normalize reported auth failures to canonical rule34 domain', () => {
    const selectedCredential = service.getAvailableCredential('https://rule34.xxx/index.php?page=dapi')

    expect(selectedCredential).not.toBeNull()

    service.reportAuthFailure({
      domain: 'https://api.rule34.xxx/index.php?page=dapi',
      user: selectedCredential!.user,
      error: 'HTTP 403',
      timestamp: new Date()
    })

    const disabledCredentials = service.getDisabledCredentials()

    expect(
      disabledCredentials.some((cred) => cred.domain === 'rule34.xxx' && cred.user === selectedCredential!.user)
    ).toBe(true)
  })
})
