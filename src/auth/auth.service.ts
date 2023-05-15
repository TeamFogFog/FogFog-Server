import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom, catchError, ObservableInput } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as argon2 from 'argon2';
import { AxiosError } from 'axios';
import { UsersService } from 'src/users/users.service';
import { ResponseCallbackData } from './dto/response-callback.dto';
import { SigninDto } from './dto/signin.dto';
import CustomException from 'src/exceptions/custom.exception';
import { SOCIAL_TYPE, GENDER_TYPE, RESPONSE_MESSAGE } from 'src/common/objects';
import { convertObjectKey } from 'src/utils/convertObjectKey';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { JwtToken } from 'src/common/interfaces/jwt-token.interface';
import { ResponseSigninData } from './dto/response-signin.dto';
import { ResponseTokenData } from './dto/response-token.dto';
import {
  AppleJwtTokenPayload,
  DecodedTokenPayload,
  RequestTokenPayload,
} from 'src/common/interfaces/apple-payload.interface';
import * as jwt from 'jsonwebtoken';
import JwksRsa, { JwksClient } from 'jwks-rsa';
import * as fs from 'fs';
import { join, resolve } from 'path';
import * as qs from 'qs';
import {
  forbidden,
  internalServerError,
  notFound,
  unauthorized,
} from 'src/utils/error';

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
  ): Promise<ResponseTokenData | CustomException> {
    try {
      const user = <User>await this.usersService.getUserById(id);
      if (!user || !user.refreshToken) {
        return forbidden();
      }

      const isRefreshTokenMatch: boolean = await argon2.verify(
        user.refreshToken,
        hashedRefreshToken,
      );
      if (!isRefreshTokenMatch) {
        return forbidden();
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
      return internalServerError();
    }
  }

  async getKakaoAccessToken(
    code: string,
  ): Promise<ResponseCallbackData | CustomException> {
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
      return internalServerError();
    }
  }

  async createKakaoUser(
    signinDto: SigninDto,
  ): Promise<ResponseSigninData | CustomException> {
    const { kakaoAccessToken, socialType }: SigninDto = signinDto;

    if (!kakaoAccessToken) {
      return unauthorized();
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
        return notFound();
      }

      this.logger.debug('get kakao user success', userResponse.data);

      const { id } = userResponse.data;
      const { profile, email, age_range, has_gender, gender } =
        userResponse.data?.kakao_account;

      let user = <User>await this.usersService.getUserByKaKaoId(id);

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

        user = <User>await this.usersService.createUser(newUser);
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
      return internalServerError();
    }
  }

  async getAppleRefreshToken(code: string): Promise<string | CustomException> {
    const header = {
      kid: this.config.get<string>('appleKeyId'),
      alg: 'ES256',
    };

    const payload = {
      iss: this.config.get<string>('appleTeamId'),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 15777000,
      aud: 'https://appleid.apple.com',
      sub: this.config.get<string>('appleClientId'),
    };

    this.logger.debug('apple refresh token header', header);
    this.logger.debug(
      'apple refresh token payload',
      JSON.stringify(payload, null, '\t'),
    );

    const privateKey: string = fs
      .readFileSync(
        resolve(__dirname, `../${this.config.get<string>('appleKeyFilePath')}`),
      )
      .toString();

    try {
      const clientSecret = jwt.sign(payload, privateKey, {
        header,
      });

      this.logger.debug('apple client secret', clientSecret);

      const data: RequestTokenPayload = {
        client_id: this.config.get<string>('appleClientId'),
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
      };

      this.logger.debug(
        'request token payload data',
        JSON.stringify(data, null, '\t'),
      );

      const response = await firstValueFrom(
        this.http
          .post('https://appleid.apple.com/auth/token', qs.stringify(data))
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw new CustomException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR,
              );
            }),
          ),
      );

      return response.data.refresh_token as string;
    } catch (error) {
      this.logger.error(error);
      return internalServerError();
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

  async createAppleUser(
    signinDto: SigninDto,
  ): Promise<ResponseSigninData | CustomException> {
    try {
      const verifiedToken: AppleJwtTokenPayload = await this.verifyAppleIdToken(
        signinDto.idToken,
      );

      this.logger.debug('verify apple id token success');

      const { sub, email } = verifiedToken;

      let user = <User>await this.usersService.getUserByAppleId(sub);
      this.logger.debug(
        'get user by apple id',
        JSON.stringify(user, null, '\t'),
      );
      if (!user) {
        const refreshToken = await this.getAppleRefreshToken(signinDto.code);

        this.logger.debug('request apple refresh token success', refreshToken);

        let convertSocialType: number = convertObjectKey(
          SOCIAL_TYPE,
          signinDto.socialType,
        );

        const newUser = {
          appleId: sub,
          socialType: convertSocialType,
          email: email ?? undefined,
          appleRefreshToken: refreshToken,
        };

        this.logger.debug(
          'create apple user',
          JSON.stringify(newUser, null, '\t'),
        );

        user = <User>await this.usersService.createUser(newUser);
      }

      const tokens: JwtToken = <JwtToken>await this.getJwtToken(user);
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
      return internalServerError();
    }
  }
}
