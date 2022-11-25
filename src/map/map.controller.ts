import { Controller, Get, Param, Query, HttpStatus } from '@nestjs/common';
import { MapService } from './map.service';
import { EachRecipeResponseDto, ReadMapDto } from './dto/read-map.dto';
import { wrapSuccess } from '../utils/success';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseCallbackDto } from 'src/auth/dto/response-callback.dto';

@Controller('maps')
@ApiTags('maps')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get('/:id?')
  @ApiOperation({
    summary: '흡연구역 상세 조회 API',
  })
  async getMapById(
    @Param('id') id: number,
    @Query('lat') lat: number,
    @Query('lang') lang: number,
  ): Promise<EachRecipeResponseDto> {
    const data: ReadMapDto = await this.mapService.getMapById(id, lat, lang);
    return wrapSuccess(HttpStatus.OK, '흡연구역 상세 조회 성공', data);
  }
}
