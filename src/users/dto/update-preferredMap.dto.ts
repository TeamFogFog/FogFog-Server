import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdatePreferredMapDto {
  @ApiProperty({ description: '0 - 카카오 / 1 - 구글 / 2 - 네이버' })
  @IsNumber()
  @IsNotEmpty()
  preferredMap: 0 | 1 | 2;
}

export class UpdatePreferredMapParams {
  @IsNumber()
  @Type(() => Number)
  readonly id: number;
}
