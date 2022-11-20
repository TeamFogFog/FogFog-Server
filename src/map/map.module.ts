import { Module } from '@nestjs/common';
import { MapService } from './map.service';
import { MapController } from './map.controller';

@Module({
  controllers: [MapController],
  providers: [MapService]
})
export class MapModule {}
