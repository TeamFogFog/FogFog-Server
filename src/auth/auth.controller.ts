import { Body, Controller, Get, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { wrapSuccess } from 'src/utils/success';
import { AuthService } from './auth.service';
import { ResponseCallbackDto } from './dto/response-callback.dto';
import { SignInDto } from './dto/signin.dto';

@Controller('auth')
@ApiTags('Auth')
@ApiResponse({ type: ResponseCallbackDto })
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/kakao/callback')
  @ApiOperation({
    summary: '카카오 로그인 콜백 API',
    description: '서버 access_token 발급용 콜백',
  })
  async kakaoLoginCallback(
    @Query('code') code: string,
  ): Promise<ResponseCallbackDto> {
    const data = await this.authService.getKakaoAccessToken(code);

    return wrapSuccess(HttpStatus.OK, 'access token 발급 성공', data);
  }

  @Post('/signin')
  @ApiOperation({
    summary: '소셜 로그인 API',
  })
  async signin(@Body() signInDto: SignInDto) {
    const { socialType } = signInDto;

    switch (socialType) {
      case 'kakao':
        await this.authService.createKakaoUser(signInDto);
        break;
    }
  }
}
