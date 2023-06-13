import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export enum PreferredMapType {
  'kakao' = 0,
  'google' = 1,
  'naver' = 2,
}
export class UpdatePreferredMapDto {
  @ApiProperty({ description: '0 - 카카오 / 1 - 구글 / 2 - 네이버' })
  @IsNumber()
  @IsNotEmpty()
  @IsEnum(PreferredMapType)
  preferredMap: PreferredMapType;
}

export class UpdatePreferredMapParams {
  @IsNumber()
  @Type(() => Number)
  readonly id: number;
}
