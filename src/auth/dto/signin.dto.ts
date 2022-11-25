import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty({ required: true, description: 'kakao / apple' })
  @IsString()
  @IsNotEmpty()
  socialType: string;

  @ApiProperty({ description: 'kakao access token' })
  kakaoAccessToken?: string;

  @ApiProperty({ description: 'apple id token' })
  idToken?: string;
}
