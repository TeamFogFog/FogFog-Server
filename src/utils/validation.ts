import { SigninDto } from 'src/auth/dto/signin.dto';
import { CustomException } from 'src/exceptions';
import { badRequest } from './error';

export const validationSignin = async (
  createSigninDto: SigninDto,
): Promise<CustomException> => {
  const { socialType, kakaoAccessToken, idToken, code } = createSigninDto;

  if (!kakaoAccessToken && !idToken && !code) {
    return badRequest();
  }

  if (kakaoAccessToken && idToken && code) {
    return badRequest();
  }

  if (socialType === 'kakao' && !kakaoAccessToken) {
    return badRequest();
  }

  if (socialType === 'apple') {
    if ((idToken && !code) || (!idToken && code)) {
      return badRequest();
    }
  }
};
