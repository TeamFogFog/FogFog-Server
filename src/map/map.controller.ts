import { Controller, Get, Param, Query } from '@nestjs/common';
import { MapService } from './map.service';
import { EachRecipeResponseDto, ReadMapDto } from './read-map.dto';
import { wrapSuccess } from '../utils/success';
import { wrap } from 'module';

@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get('/maps/:id?')
  async getMapById(
    @Param('id') id: number,
    @Query('lat') lat: number,
    @Query('lang') lang: number,
  ): Promise<any> {
    const data = await this.mapService.getMapById(id, lat, lang);
    const result = wrapSuccess(200, '성공 ~', data);
    return result;
  }
}
