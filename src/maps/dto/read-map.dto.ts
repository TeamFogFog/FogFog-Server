import { Type } from 'class-transformer';
import { IsLatitude, IsLongitude, IsNumber } from 'class-validator';

export class ReadSmokingAreaParam {
  @IsNumber()
  @Type(() => Number)
  readonly id: number;
}

export class ReadSmokingAreaQuery {
  @IsLatitude()
  @Type(() => Number)
  readonly lat: number;

  @IsLongitude()
  @Type(() => Number)
  readonly long: number;
}
