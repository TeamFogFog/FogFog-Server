import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as argon2 from 'argon2';
import { UsersService } from 'src/users/users.service';
import { ResponseCallback } from './dto/response-callback.dto';
import { SignInDto } from './dto/signin.dto';
import CustomException from 'src/exceptions/custom.exception';
import { SOCIAL_TYPE, GENDER_TYPE } from 'src/common/objects';
import { convertObjectKey } from 'src/utils/convertObjectKey';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { JwtToken } from 'src/common/interfaces/jwt-token.interface';
import { ResponseSignIn } from './dto/response-signin.dto';

@Injectable()
export class AuthService {
  constructor(
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

  async getHashedRefreshToken(refreshToken: string): Promise<string> {
    return await argon2.hash(refreshToken);
  }

  async getKakaoAccessToken(code: string): Promise<ResponseCallback> {
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

  async createKakaoUser(signInDto: SignInDto): Promise<ResponseSignIn> {
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

      this.logger.debug('get kakao user success', userResponse.data);

      const { id } = userResponse.data;
      const { profile, email, age_range, has_gender, gender } =
        userResponse.data?.kakao_account;

      let user = await this.usersService.getUserByKaKaoId(id);

      if (!user) {
        let convertGenderType: number | undefined;

        let convertSocialType: number = convertObjectKey(
          SOCIAL_TYPE,
          socialType,
        );

        if (has_gender) {
          convertGenderType = convertObjectKey(GENDER_TYPE, gender);
        }

        const newUser = {
          name: profile.nickname,
          nickname: profile.nickname,
          socialType: convertSocialType,
          kakaoId: id,
          email: email ?? undefined,
          age: age_range ?? undefined,
          sex: convertGenderType,
        };

        user = await this.usersService.createUser(newUser);
      }

      const tokens: JwtToken = await this.getJwtToken(user);
      const hashedRefreshToken: string = await this.getHashedRefreshToken(
        tokens.refreshToken,
      );

      await this.usersService.updateRefreshTokenByUserId(
        user.id,
        hashedRefreshToken,
      );

      return {
        ...tokens,
        id: user.id,
      };
    } catch (error) {
      this.logger.error(error);
      throw new CustomException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Internal Server Error',
      );
    }
  }
}
