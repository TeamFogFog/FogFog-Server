import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsLatitude, IsLongitude } from 'class-validator';
import { ResponseSuccessDto } from 'src/common/dto/response-success.dto';

export class ResponseSmokingAreas {
  @ApiProperty()
  id: number;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;
}

export class ResponseSmokingAreasData {
  @ApiProperty()
  total: number;

  @ApiProperty({
    isArray: true,
    type: ResponseSmokingAreas,
  })
  areas: ResponseSmokingAreas[];
}

export class ResponseSmokingAreasDto extends ResponseSuccessDto {
  @ApiProperty()
  data: ResponseSmokingAreasData;
}

export class ReadSmokingAreasQuery {
  @IsLatitude()
  @Type(() => Number)
  readonly lat: number;

  @IsLongitude()
  @Type(() => Number)
  readonly long: number;
}
