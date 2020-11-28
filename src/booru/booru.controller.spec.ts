import { Test, TestingModule } from '@nestjs/testing';
import { BooruController } from './booru.controller';

describe('BooruController', () => {
  let controller: BooruController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooruController],
    }).compile();

    controller = module.get<BooruController>(BooruController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
