import { ResponseSuccessDto } from '../common/dto/response-success.dto';

export class ReadMapDto {
  name: string;
  address: string;
  image: string;
  distance: string;
}

export class EachRecipeResponseDto extends ResponseSuccessDto {
  data: ReadMapDto;
}
