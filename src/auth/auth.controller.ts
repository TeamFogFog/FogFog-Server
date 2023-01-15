import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { wrapSuccess } from 'src/utils/success';
import { AuthService } from './auth.service';
import { ResponseCallbackDto } from './dto/response-callback.dto';
import {
  ResponseSignInData,
  ResponseSignInDto,
} from './dto/response-signin.dto';
import { ResponseTokenData, ResponseTokenDto } from './dto/response-token.dto';
import { SignInDto } from './dto/signin.dto';
import { RefreshTokenGuard } from './guards';

@Controller('auth')
@ApiTags('Auth')
@ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('kakao/callback')
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

  @Post('signin')
  @ApiOperation({
    summary: '소셜 로그인 API',
    description:
      '카카오/애플 로그인을 진행하고, access/refresh token을 발급합니다.',
  })
  @ApiCreatedResponse({ type: ResponseSignInDto })
  @ApiNotFoundResponse({
    description:
      'Not Found - 소셜 로그인 토큰에 해당하는 유저 정보가 없는 경우',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - 소셜 로그인 토큰이 없거나 유효하지 않은 경우',
  })
  async signin(@Body() signInDto: SignInDto): Promise<ResponseSignInDto> {
    const { socialType } = signInDto;
    let data: ResponseSignInData;

    switch (socialType) {
      case 'kakao':
        data = await this.authService.createKakaoUser(signInDto);
        break;
    }

    return wrapSuccess(HttpStatus.CREATED, '로그인/회원가입 성공', data);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('reissue/token')
  @ApiBearerAuth('refreshToken')
  @ApiOperation({
    summary: 'token 재발급 API',
    description: 'refresh token 을 이용해 토큰을 재발급합니다.',
  })
  @ApiOkResponse({ type: ResponseTokenDto })
  @ApiForbiddenResponse({
    description:
      'Forbidden - 해당 유저의 accessToken, refreshToken이 유효하지(실제 DB와 매치되지) 않은 경우',
  })
  async updateToken(@Req() req): Promise<ResponseTokenDto> {
    const { id, refreshToken } = req.user;

    const data: ResponseTokenData = await this.authService.updateToken(
      id,
      refreshToken,
    );

    return wrapSuccess(HttpStatus.OK, '토큰 재발급 성공', data);
  }
}
