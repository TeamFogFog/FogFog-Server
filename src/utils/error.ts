import { HttpStatus } from '@nestjs/common';
import { CustomException } from '../exceptions';
import { RESPONSE_MESSAGE } from '../common/objects';

export const internalServerError = () => {
  return new CustomException(
    HttpStatus.INTERNAL_SERVER_ERROR,
    RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR,
  );
};

export const badRequest = () => {
  return new CustomException(
    HttpStatus.BAD_REQUEST,
    RESPONSE_MESSAGE.BAD_REQUEST,
  );
};

export const unauthorized = () => {
  return new CustomException(
    HttpStatus.UNAUTHORIZED,
    RESPONSE_MESSAGE.UNAUTHORIZED,
  );
};

export const forbidden = () => {
  return new CustomException(HttpStatus.FORBIDDEN, RESPONSE_MESSAGE.FORBIDDEN);
};

export const notFound = () => {
  return new CustomException(HttpStatus.NOT_FOUND, RESPONSE_MESSAGE.NOT_FOUND);
};

export const conflict = () => {
  return new CustomException(HttpStatus.CONFLICT, RESPONSE_MESSAGE.DUPLICATED);
};
