import { Test, TestingModule } from '@nestjs/testing';
import { StarWarsController } from './star-wars.controller';

describe('StarWarsController', () => {
  let controller: StarWarsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StarWarsController],
    }).compile();

    controller = module.get<StarWarsController>(StarWarsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
