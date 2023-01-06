import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class UpdateNicknameDto {
  @ApiProperty({ description: '수정할 nickname' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(8)
  nickname: string;
}

export class UpdateNicknameParams {
  @IsNumber()
  @Type(() => Number)
  readonly id: number;
}
