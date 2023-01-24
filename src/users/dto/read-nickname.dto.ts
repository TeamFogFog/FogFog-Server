import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ReadNicknameParams {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly id: number;
}
