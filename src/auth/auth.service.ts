import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from 'src/users/users.service';
import { CallbackResponse } from './dto/response-callback.dto';
import { SignInDto } from './dto/signin.dto';
import CustomException from 'src/exceptions/custom.exception';
import { SOCIAL_TYPE } from 'src/common/constants/social-type';
import { convertObjectKey } from 'src/utils/convertObjectKey';
import { JwtPayload } from 'src/common/interfaces/jwtPayload';
import { JwtToken } from 'src/common/interfaces/JwtToken';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly http: HttpService,
    private readonly usersService: UsersService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async getJwtToken(user: User): Promise<JwtToken> {
    const uniqueId: string =
      SOCIAL_TYPE[user.socialType] === 'kakao'
        ? user.kakaoId.toString()
        : user.appleId;

    const payload: JwtPayload = {
      id: user.id,
      socialType: user.socialType,
      uniqueId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('accessTokenSecret'),
        expiresIn: '10d',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('refreshTokenSecret'),
        expiresIn: '30d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

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

      let user = await this.usersService.getUserByKaKaoId(kakaoId);

      if (!user) {
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

        user = newUser[0];
      }

      const { accessToken, refreshToken } = await this.getJwtToken(user);
    } catch (error) {
      this.logger.error(error);
      throw new CustomException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Internal Server Error',
      );
    }
  }
}
