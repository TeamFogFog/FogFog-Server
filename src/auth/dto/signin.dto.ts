import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SigninDto {
  @ApiProperty({ required: true, description: 'kakao / apple' })
  @IsString()
  @IsNotEmpty()
  socialType: string;

  @ApiPropertyOptional({ description: 'kakao access token' })
  kakaoAccessToken?: string;

  @ApiPropertyOptional({ description: 'apple id token' })
  idToken?: string;
}
