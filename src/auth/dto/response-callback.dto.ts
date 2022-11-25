import { ApiProperty } from '@nestjs/swagger';
import { ResponseSuccessDto } from 'src/common/dto/response-success.dto';
export class ResponseCallback {
  @ApiProperty()
  accessToken: string;
}

export class ResponseCallbackDto extends ResponseSuccessDto {
  @ApiProperty()
  data: ResponseCallback;
}
