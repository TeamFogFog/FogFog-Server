import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CallbackResponseDto } from './dto/response-callback.dto';

@Controller('auth')
@ApiTags('Auth')
@ApiResponse({ type: CallbackResponseDto })
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/kakao/callback')
  @ApiOperation({
    summary: '카카오 로그인 콜백 API',
    description: '서버 access_token 발급용 콜백',
  })
  async kakaoLoginCallback(
    @Query('code') code: string,
  ): Promise<CallbackResponseDto> {
    return this.authService.getKakaoAccessToken(code);
  }
}
