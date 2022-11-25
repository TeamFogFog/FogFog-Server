import { Body, Controller, Get, HttpStatus, Post, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ResponseErrorDto } from 'src/common/dto/response-error.dto';
import { wrapSuccess } from 'src/utils/success';
import { AuthService } from './auth.service';
import { ResponseCallbackDto } from './dto/response-callback.dto';
import { ResponseSignIn, ResponseSignInDto } from './dto/response-signin.dto';
import { SignInDto } from './dto/signin.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/kakao/callback')
  @ApiOperation({
    summary: '카카오 로그인 콜백 API',
    description:
      '서버 테스트용 access_token 발급 콜백 - 클라에서 사용하지 않아도 됩니다.',
  })
  @ApiOkResponse({ type: ResponseCallbackDto })
  async kakaoLoginCallback(
    @Query('code') code: string,
  ): Promise<ResponseCallbackDto> {
    const data = await this.authService.getKakaoAccessToken(code);

    return wrapSuccess(HttpStatus.OK, 'access token 발급 성공', data);
  }

  @Post('/signin')
  @ApiOperation({
    summary: '소셜 로그인 API',
    description:
      '카카오/애플 로그인을 진행하고, access/refresh token을 발급합니다.',
  })
  @ApiCreatedResponse({ type: ResponseSignInDto })
  @ApiNotFoundResponse({ type: ResponseErrorDto })
  @ApiUnauthorizedResponse({ type: ResponseErrorDto })
  @ApiInternalServerErrorResponse({
    type: ResponseErrorDto,
  })
  async signin(@Body() signInDto: SignInDto): Promise<ResponseSignInDto> {
    const { socialType } = signInDto;
    let data: ResponseSignIn;

    switch (socialType) {
      case 'kakao':
        data = await this.authService.createKakaoUser(signInDto);
        break;
    }

    return wrapSuccess(HttpStatus.CREATED, '로그인/회원가입 성공', data);
  }
}
