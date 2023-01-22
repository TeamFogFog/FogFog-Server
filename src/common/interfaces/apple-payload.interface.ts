import * as jwt from 'jsonwebtoken';

export interface AppleJwtTokenPayload {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string;
  nonce: string;
  c_hash: string;
  email?: string;
  email_verified?: string;
  is_private_email?: string;
  auth_time: number;
  nonce_supported: boolean;
}

export interface DecodedTokenPayload {
  header: {
    kid: string;
    alg: jwt.Algorithm;
  };
  payload: {
    sub: string;
  };
}
