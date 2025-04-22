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
})
