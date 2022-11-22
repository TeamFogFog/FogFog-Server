import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CallbackResponseDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  accessToken: string;
}
