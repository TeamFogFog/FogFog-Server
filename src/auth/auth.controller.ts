import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Patch,
  Query,
  Req,
  UseGuards,
  Param,
  Delete,
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
  ApiBadRequestResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AccessTokenGuard } from './guards';
import { ResponseSuccessDto } from 'src/common/dto/response-success.dto';
import { RESPONSE_MESSAGE } from 'src/common/objects';
import { wrapSuccess } from 'src/utils/success';
import { validationSignin } from 'src/utils/validation';
import { AuthService } from './auth.service';
import { ResponseCallbackDto } from './dto/response-callback.dto';
import {
  ResponseSigninData,
  ResponseSigninDto,
} from './dto/response-signin.dto';
import { ResponseTokenData, ResponseTokenDto } from './dto/response-token.dto';
import { SigninDto } from './dto/signin.dto';
import { RefreshTokenGuard } from './guards';
import { DeleteUserParams } from './dto/delete-user.dto';

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

    return wrapSuccess(
      HttpStatus.OK,
      RESPONSE_MESSAGE.ISSUED_TOKEN_SUCCESS,
      data,
    );
  }

  @Post('signin')
  @ApiOperation({
    summary: '소셜 로그인 API',
    description:
      '카카오/애플 로그인을 진행하고, access/refresh token을 발급합니다.',
  })
  @ApiCreatedResponse({ type: ResponseSigninDto })
  @ApiBadRequestResponse({
    description:
      'Bad Request - 소셜 로그인 토큰을 보내지 않거나 kakao, apple 둘 다 보낸 경우',
  })
  @ApiNotFoundResponse({
    description:
      'Not Found - 소셜 로그인 토큰에 해당하는 유저 정보가 없는 경우',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - 소셜 로그인 토큰이 없거나 유효하지 않은 경우',
  })
  async signin(@Body() signinDto: SigninDto): Promise<ResponseSigninDto> {
    await validationSignin(signinDto);

    const { socialType } = signinDto;
    let data: ResponseSigninData;

    switch (socialType) {
      case 'kakao':
        data = (await this.authService.createKakaoUser(
          signinDto,
        )) as ResponseSigninData;
        break;
      case 'apple':
        data = (await this.authService.createAppleUser(
          signinDto,
        )) as ResponseSigninData;
    }

    return wrapSuccess(
      HttpStatus.CREATED,
      RESPONSE_MESSAGE.SIGNIN_USER_SUCCESS,
      data,
    );
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

    const data: ResponseTokenData = (await this.authService.updateToken(
      id,
      refreshToken,
    )) as ResponseTokenData;

    return wrapSuccess(
      HttpStatus.OK,
      RESPONSE_MESSAGE.REISSUED_TOKEN_SUCCESS,
      data,
    );
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: '회원 탈퇴 API',
    description: '회원 탈퇴',
  })
  @ApiBearerAuth('accessToken')
  @ApiParam({
    type: Number,
    name: 'id',
    required: true,
    description: 'user id',
  })
  @ApiOkResponse({ type: ResponseSuccessDto })
  async deleteUser(
    @Req() req,
    @Param() { id }: DeleteUserParams,
  ): Promise<ResponseSuccessDto> {
    await this.authService.deleteUserByUserId(req.user?.id, id);
    return wrapSuccess(
      HttpStatus.NO_CONTENT,
      RESPONSE_MESSAGE.DELETE_USER_SUCCESS,
    );
  }
}
