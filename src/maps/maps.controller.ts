import { Controller, Get, Param, Query, HttpStatus } from '@nestjs/common';
import { MapsService } from './maps.service';
import {
  ResponseSmokingAreaDto,
  ResponseSmokingAreaData,
  UpdateMapParam,
} from './dto/read-map.dto';
import { wrapSuccess } from '../utils/success';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('maps')
@ApiTags('maps')
export class MapsController {
  constructor(private readonly mapService: MapsService) {}

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
    const data: ResponseSmokingAreaData = await this.mapService.getMapById(
      id,
      lat,
      lang,
    );
    return wrapSuccess(HttpStatus.OK, '흡연구역 상세 조회 성공', data);
  }
}
