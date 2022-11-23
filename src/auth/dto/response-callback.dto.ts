import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ResponseSuccessDto } from 'src/common/dto/response-success.dto';

export class CallbackResponse {
  @ApiProperty()
  accessToken: string;
}
export class ResponseCallbackDto extends ResponseSuccessDto {
  @ApiProperty()
  data: CallbackResponse;
}
