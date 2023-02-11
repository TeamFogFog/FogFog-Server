import {
  Controller,
  Get,
  Param,
  Query,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { MapsService } from './maps.service';
import { ReadSmokingAreaParam, ReadSmokingAreaQuery } from './dto/read-map.dto';
import {
  ResponseSmokingAreaData,
  ResponseSmokingAreaDto,
} from './dto/response-map.dto';
import { wrapSuccess } from '../utils/success';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards';
import { ReadSmokingAreasQuery } from './dto/read-maps.dto';
import {
  ResponseSmokingAreasData,
  ResponseSmokingAreasDto,
} from './dto/response-maps.dto';
import { RESPONSE_MESSAGE } from 'src/common/objects';

@Controller('maps')
@UseGuards(AccessTokenGuard)
@ApiTags('maps')
@ApiBearerAuth('accessToken')
@ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
export class MapsController {
  constructor(private readonly mapService: MapsService) {}

  @Get('')
  @ApiOperation({
    summary: '흡연구역 전체 조회 API',
    description: '현재 위/경도 기준 반경 2km 이내 흡연구역 조회',
  })
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
  @ApiBadRequestResponse({
    description: 'Bad Request - 요청 위/경도가 잘못된 타입이나 형태 일 경우',
  })
  async getMapsByLatAndLong(
    @Query() { lat, long }: ReadSmokingAreasQuery,
  ): Promise<ResponseSmokingAreasDto> {
    const data: ResponseSmokingAreasData =
      (await this.mapService.getMapsByLatAndLong(
        lat,
        long,
      )) as ResponseSmokingAreasData;

    return wrapSuccess(
      HttpStatus.OK,
      RESPONSE_MESSAGE.READ_SMOKING_AREAS_SUCCESS,
      data,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: '흡연구역 상세 조회 API',
    description: '흡연구역 상세 데이터를 반환합니다.',
  })
  @ApiParam({
    type: Number,
    name: 'id',
    required: true,
    description: 'map id',
  })
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
  @ApiBadRequestResponse({
    description: 'Bad Request - 요청 위/경도가 잘못된 타입이나 형태일 경우',
  })
  @ApiNotFoundResponse({
    description:
      'Not Found - 요청 흡연구역 id에 해당하는 자원이 존재하지 않을 때',
  })
  async getMapById(
    @Param() { id }: ReadSmokingAreaParam,
    @Query() { lat, long }: ReadSmokingAreaQuery,
  ): Promise<ResponseSmokingAreaDto> {
    const data: ResponseSmokingAreaData = (await this.mapService.getMapById(
      id,
      lat,
      long,
    )) as ResponseSmokingAreaData;
    return wrapSuccess(
      HttpStatus.OK,
      RESPONSE_MESSAGE.READ_SMOKING_AREA_SUCCESS,
      data,
    );
  }
}
