import { ApiProperty } from '@nestjs/swagger';
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
