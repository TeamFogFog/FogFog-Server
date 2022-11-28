import { ResponseSuccessDto } from '../../common/dto/response-success.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class ResponseSmokingArea {
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
  data: ResponseSmokingArea;
}

export class UpdateMapParam {
  @IsNumber()
  @Type(() => Number)
  readonly id: number;
}
