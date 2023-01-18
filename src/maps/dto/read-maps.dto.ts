import { Type } from 'class-transformer';
import { IsLatitude, IsLongitude } from 'class-validator';

export class ReadSmokingAreasQuery {
  @IsLatitude()
  @Type(() => Number)
  readonly lat: number;

  @IsLongitude()
  @Type(() => Number)
  readonly long: number;
}
