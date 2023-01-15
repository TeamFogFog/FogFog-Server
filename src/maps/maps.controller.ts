import {
  Controller,
  Get,
  Param,
  Query,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { MapsService } from './maps.service';
import {
  ResponseSmokingAreaDto,
  ResponseSmokingAreaData,
  ReadSmokingAreaParam,
  ReadSmokingAreaQuery,
} from './dto/read-map.dto';
import { wrapSuccess } from '../utils/success';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards';
import {
  ReadSmokingAreasQuery,
  ResponseSmokingAreasData,
  ResponseSmokingAreasDto,
} from './dto/read-maps.dto';

@Controller('maps')
@ApiTags('maps')
export class MapsController {
  constructor(private readonly mapService: MapsService) {}

  @UseGuards(AccessTokenGuard)
  @Get('')
  @ApiOperation({
    summary: '흡연구역 전체 조회 API',
    description: '현재 위/경도 기준 반경 2km 이내 흡연구역 조회',
  })
  @ApiBearerAuth('accessToken')
  @ApiQuery({
    type: Number,
    name: 'lat',
    required: true,
    description: '중심 latitude',
  })
  @ApiQuery({
    type: Number,
    name: 'long',
    required: true,
    description: '중심 longitude',
  })
  @ApiOkResponse({ type: ResponseSmokingAreasDto })
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse()
  async getMapsByLatAndLong(
    @Query() { lat, long }: ReadSmokingAreasQuery,
  ): Promise<ResponseSmokingAreasDto> {
    const data: ResponseSmokingAreasData =
      await this.mapService.getMapsByLatAndLong(lat, long);

    return wrapSuccess(HttpStatus.OK, '흡연구역 전체 조회 성공', data);
  }

  @UseGuards(AccessTokenGuard)
  @Get(':id')
  @ApiOperation({
    summary: '흡연구역 상세 조회 API',
  })
  @ApiBearerAuth('accessToken')
  @ApiQuery({
    type: Number,
    name: 'lat',
    required: true,
    description: '중심 latitude',
  })
  @ApiQuery({
    type: Number,
    name: 'long',
    required: true,
    description: '중심 longitude',
  })
  @ApiOkResponse({ type: ResponseSmokingAreaDto })
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  async getMapById(
    @Param() { id }: ReadSmokingAreaParam,
    @Query() { lat, long }: ReadSmokingAreaQuery,
  ): Promise<ResponseSmokingAreaDto> {
    const data: ResponseSmokingAreaData = await this.mapService.getMapById(
      id,
      lat,
      long,
    );
    return wrapSuccess(HttpStatus.OK, '흡연구역 상세 조회 성공', data);
  }
}
