import { ApiProperty } from '@nestjs/swagger';
import { ResponseSuccessDto } from 'src/common/dto/response-success.dto';

export class ResponseNicknameData {
  @ApiProperty({ description: '수정된 닉네임' })
  nickname: string;
}

export class ResponseNicknameDto extends ResponseSuccessDto {
  @ApiProperty()
  data: ResponseNicknameData;
}
