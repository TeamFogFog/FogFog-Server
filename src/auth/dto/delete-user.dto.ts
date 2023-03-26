import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class DeleteUserParams {
  @IsNumber()
  @Type(() => Number)
  readonly id: number;
}
