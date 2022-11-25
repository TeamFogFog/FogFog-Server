import { ApiProperty } from '@nestjs/swagger';
import { ResponseSuccessDto } from 'src/common/dto/response-success.dto';

export class ResponseSignIn {
  @ApiProperty({ description: 'id' })
  id: number;

  @ApiProperty({ description: 'access token' })
  accessToken: string;

  @ApiProperty({ description: 'refresh token' })
  refreshToken: string;
}

export class ResponseSignInDto extends ResponseSuccessDto {
  @ApiProperty()
  data: ResponseSignIn;
}
