import { ResponseSuccessDto } from '../../common/dto/response-success.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

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

export class ReadSmokingAreaParam {
  @IsNumber()
  @Type(() => Number)
  readonly id: number;
}
