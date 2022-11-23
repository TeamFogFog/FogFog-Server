import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty()
  @IsString()
  kakaoAccessToken?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  socialType: string;
}
