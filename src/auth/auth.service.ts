import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { CallbackResponse } from './dto/response-callback.dto';
import { SignInDto } from './dto/signin.dto';
import CustomException from 'src/exceptions/custom.exception';

import { PrismaService } from 'src/prisma.service';
import { SOCIAL_TYPE } from 'src/common/constants/social-type';
import { convertObjectKey } from 'src/utils/convertObjectKey';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async getKakaoAccessToken(code: string): Promise<CallbackResponse> {
    const kakaoRequestTokenUrl = `https://kauth.kakao.com/oauth/token
	?grant_type=authorization_code
	&client_id=${this.config.get('kakaoClientId')}
	&redirect_url=${this.config.get('kakaoRedirectUrl')}
	&code=${code}`;

    try {
      const tokenResponse = await firstValueFrom(
        this.http.post(kakaoRequestTokenUrl),
      );
      const accessToken: string = tokenResponse.data.access_token;

      return { accessToken };
    } catch (error) {
      this.logger.error({ error });
      throw new CustomException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Internal Server Error',
      );
    }
  }

  async getUserByKaKaoId(kakaoId: number) {
    return await this.prisma.user.findMany({
      where: {
        kakaoId,
      },
    });
  }

  async createKakaoUser(signInDto: SignInDto) {
    const { kakaoAccessToken, socialType }: SignInDto = signInDto;

    if (!kakaoAccessToken) {
      throw new CustomException(
        HttpStatus.UNAUTHORIZED,
        'Uunautorized - No Access Token',
      );
    }

    const requestHeader = {
      Authorization: `Bearer ${kakaoAccessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    };

    const kakaoRequestUserUrl = `https://kapi.kakao.com/v2/user/me`;

    try {
      const userResponse = await firstValueFrom(
        this.http.get(kakaoRequestUserUrl, {
          headers: requestHeader,
        }),
      );
      if (!userResponse) {
        throw new CustomException(
          HttpStatus.NOT_FOUND,
          'Not Found - Kakao User',
        );
      }
      this.logger.debug(userResponse.data);

      const kakaoId: number = userResponse.data.id;
      const { kakaoAccount } = userResponse.data.kakao_account;

      // 디비에서 유저 회원번호가 존재하는 지 찾아본다
      const user = await this.getUserByKaKaoId(kakaoId);

      if (!user.length) {
        let convertSocialType: number = convertObjectKey(
          SOCIAL_TYPE,
          socialType,
        );

        const newUser = await this.prisma.user.create({
          data: {
            socialType: convertSocialType,
            kakaoId,
          },
        });
      }
      // if 존재 하면 유저 jwt 토큰 발급

      // 존재 하지 않으면 유저 생성 후 jwt 토큰 발급
    } catch (error) {
      this.logger.error(error);
      throw new CustomException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Internal Server Error',
      );
    }
  }
}
