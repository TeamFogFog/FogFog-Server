import { ApiProperty } from '@nestjs/swagger';
import { ResponseSuccessDto } from 'src/common/dto/response-success.dto';

export class ResponseSmokingAreaData {
  @ApiProperty()
  name: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  distance: string;
}

export class ResponseSmokingAreaDto extends ResponseSuccessDto {
  @ApiProperty()
  data: ResponseSmokingAreaData;
}
