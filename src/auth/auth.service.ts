import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { CallbackResponseDto } from './dto/response-callback.dto';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private readonly http: HttpService,
  ) {}

  async getKakaoAccessToken(code: string): Promise<CallbackResponseDto> {
    const kakaoRequestTokenUrl = `https://kauth.kakao.com/oauth/token
	?grant_type=authorization_code
	&client_id=${this.config.get('kakaoClientId')}
	&redirect_url=${this.config.get('kakaoRedirectUrl')}
	&code=${code}`;

    const tokenResponse = await firstValueFrom(
      this.http.post(kakaoRequestTokenUrl),
    );
    const accessToken: string = tokenResponse.data.access_token;

    return { accessToken };
  }
}
