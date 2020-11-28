import { Test, TestingModule } from '@nestjs/testing';
import { BooruService } from './booru.service';

describe('BooruService', () => {
  let service: BooruService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BooruService],
    }).compile();

    service = module.get<BooruService>(BooruService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
