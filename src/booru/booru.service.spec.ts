import { UnauthorizedException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { BooruService } from './booru.service'
import {
  defaultBooruList,
  completeBooruList,
  findBoorusWithValueByKey
} from '../external/r34_shared/src/util/BooruUtils'

describe('BooruController', () => {
  let service: BooruService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BooruService]
    }).compile()

    service = module.get<BooruService>(BooruService)
  })

  it('should be defined', () => {
    expect.assertions(1)

    expect(service).toBeDefined()
  })

  describe('checkIfItsFromDefaultBooruList', () => {
    it('should throw if it is NOT from the default list', () => {
      expect.assertions(1)

      const testBooru = findBoorusWithValueByKey('xbooru.com', 'domain', completeBooruList)[0]

      expect(() => service.checkIfItsFromDefaultBooruList(testBooru.domain)).toThrowError(UnauthorizedException)
    })

    it('should NOT throw if it is from the default list', () => {
      expect.assertions(1)

      const testBooru = defaultBooruList[0]

      expect(() => service.checkIfItsFromDefaultBooruList(testBooru.domain)).not.toThrowError(UnauthorizedException)
    })
  })
})
