import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as argon2 from 'argon2';
import { AxiosError } from 'axios';
import { UsersService } from 'src/users/users.service';
import { ResponseCallbackData } from './dto/response-callback.dto';
import { SignInDto } from './dto/signin.dto';
import CustomException from 'src/exceptions/custom.exception';
import { SOCIAL_TYPE, GENDER_TYPE, RESPONSE_MESSAGE } from 'src/common/objects';
import { convertObjectKey } from 'src/utils/convertObjectKey';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { JwtToken } from 'src/common/interfaces/jwt-token.interface';
import { ResponseSignInData } from './dto/response-signin.dto';
import { ResponseTokenData } from './dto/response-token.dto';
import {
  AppleJwtTokenPayload,
  DecodedTokenPayload,
} from 'src/common/interfaces/apple-payload.interface';
import * as jwt from 'jsonwebtoken';
import JwksRsa, { JwksClient } from 'jwks-rsa';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
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

  async updateToken(
    id: number,
    hashedRefreshToken: string,
  ): Promise<ResponseTokenData> {
    try {
      const user = await this.usersService.getUserById(id);
      if (!user || !user.refreshToken) {
        throw new CustomException(
          HttpStatus.FORBIDDEN,
          RESPONSE_MESSAGE.FORBIDDEN,
        );
      }

      const isRefreshTokenMatch: boolean = await argon2.verify(
        user.refreshToken,
        hashedRefreshToken,
      );
      if (!isRefreshTokenMatch) {
        throw new CustomException(
          HttpStatus.FORBIDDEN,
          RESPONSE_MESSAGE.FORBIDDEN,
        );
      }

      const newTokens = await this.getJwtToken(user);
      const newHashedRefreshToken = await this.getHashedRefreshToken(
        newTokens.refreshToken,
      );

      await this.usersService.updateRefreshTokenByUserId(
        user.id,
        newHashedRefreshToken,
      );

      return newTokens;
    } catch (error) {
      this.logger.error({ error });
      throw new CustomException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getKakaoAccessToken(code: string): Promise<ResponseCallbackData> {
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
        RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createKakaoUser(signInDto: SignInDto): Promise<ResponseSignInData> {
    const { kakaoAccessToken, socialType }: SignInDto = signInDto;

    if (!kakaoAccessToken) {
      throw new CustomException(
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGE.UNAUTHORIZED,
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
          RESPONSE_MESSAGE.NOT_FOUND,
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
      this.logger.error({ error });
      if (error instanceof AxiosError) {
        throw new CustomException(
          error.response.status,
          error.response.data.msg,
        );
      }
      throw new CustomException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async verifyAppleIdToken(idToken: string): Promise<AppleJwtTokenPayload> {
    const decodedToken: DecodedTokenPayload = jwt.decode(idToken, {
      complete: true,
    }) as DecodedTokenPayload;
    const keyIdFromToken: string = decodedToken.header.kid;

    const applePublicKeyUrl: string = 'https://appleid.apple.com/auth/keys';

    const jwksClient = new JwksClient({ jwksUri: applePublicKeyUrl });

    const key: JwksRsa.SigningKey = await jwksClient.getSigningKey(
      keyIdFromToken,
    );
    const publicKey: string = key.getPublicKey();

    const verifiedDecodedToken: AppleJwtTokenPayload = jwt.verify(
      idToken,
      publicKey,
      {
        algorithms: [decodedToken.header.alg],
      },
    ) as AppleJwtTokenPayload;

    return verifiedDecodedToken;
  }

  async createAppleUser(signInDto: SignInDto): Promise<ResponseSignInData> {
    try {
      const verifiedToken: AppleJwtTokenPayload = await this.verifyAppleIdToken(
        signInDto.idToken,
      );

      this.logger.debug('verify apple id token success', verifiedToken);

      const { sub, email } = verifiedToken;

      let user = await this.usersService.getUserByAppleId(sub);

      if (!user) {
        let convertSocialType: number = convertObjectKey(
          SOCIAL_TYPE,
          signInDto.socialType,
        );
        const newUser = {
          appleId: sub,
          socialType: convertSocialType,
          email: email ?? undefined,
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
      this.logger.error({ error });
      if (error instanceof jwt.JsonWebTokenError) {
        throw new CustomException(HttpStatus.UNAUTHORIZED, error.message);
      }
      throw new CustomException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
