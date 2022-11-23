import { Controller, Get, Param, Query } from '@nestjs/common';
import { MapService } from './map.service';
import { ReadMapDto } from './read-map.dto';

@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get('/maps/:id?')
  // async getMapById(
  //   @Param() param: { id: number },
  //   @Query() query: { lat: string; lang: string },
  // ): Promise<string> {
  //   return 'hello world';
  // }
  async getMapById(
    @Param('id') id: number,
    @Query('lat') lat: number,
    @Query('lang') lang: number,
  ): Promise<ReadMapDto> {
    return this.mapService.getMapById(id, lat, lang);
  }
}
