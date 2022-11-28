import { Controller, Get, Param, Query, HttpStatus } from '@nestjs/common';
import { MapService } from './maps.service';
import {
  ResponseSmokingAreaDto,
  ResponseSmokingArea,
  UpdateMapParam,
} from './dto/read-map.dto';
import { wrapSuccess } from '../utils/success';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('maps')
@ApiTags('maps')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get(':id')
  @ApiOperation({
    summary: '흡연구역 상세 조회 API',
  })
  async getMapById(
    // @Param('id') id: UpdateMapParam,
    @Param() { id }: UpdateMapParam,
    @Query('lat') lat: number,
    @Query('lang') lang: number,
  ): Promise<ResponseSmokingAreaDto> {
    const data: ResponseSmokingArea = await this.mapService.getMapById(
      id,
      lat,
      lang,
    );
    return wrapSuccess(HttpStatus.OK, '흡연구역 상세 조회 성공', data);
  }
}
