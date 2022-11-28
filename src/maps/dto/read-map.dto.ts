import { ResponseSuccessDto } from '../../common/dto/response-success.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ReadMapDto {
  @ApiProperty()
  name: string;
  @ApiProperty()
  address: string;
  @ApiProperty()
  image: string;
  @ApiProperty()
  distance: string;
}

export class EachRecipeResponseDto extends ResponseSuccessDto {
  @ApiProperty()
  data: ReadMapDto;
}
