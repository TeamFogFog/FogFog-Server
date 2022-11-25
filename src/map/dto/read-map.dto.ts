import { ResponseSuccessDto } from '../../common/dto/response-success.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ReadMapDto {
  @ApiProperty()
  name: string;
  address: string;
  image: string;
  distance: string;
}

export class EachRecipeResponseDto extends ResponseSuccessDto {
  @ApiProperty()
  data: ReadMapDto;
}
