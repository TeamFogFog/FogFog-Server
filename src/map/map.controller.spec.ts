import { Test, TestingModule } from '@nestjs/testing';
import { MapController } from './map.controller';
import { MapService } from './map.service';

describe('MapController', () => {
  let controller: MapController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MapController],
      providers: [MapService],
    }).compile();

    controller = module.get<MapController>(MapController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
