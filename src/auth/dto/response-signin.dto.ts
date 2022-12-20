import { ApiProperty } from '@nestjs/swagger';
import { ResponseSuccessDto } from 'src/common/dto/response-success.dto';
import { ResponseTokenData } from './response-token.dto';

export class ResponseSignInData extends ResponseTokenData {
  @ApiProperty({ description: 'id' })
  id: number;
}

export class ResponseSignInDto extends ResponseSuccessDto {
  @ApiProperty()
  data: ResponseSignInData;
}
