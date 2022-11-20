import { HttpException } from '@nestjs/common';

export default class CustomException extends HttpException {
  public statusCode: number = 0;
  public success: boolean = false;
  public message: string = '';
  public data: unknown;

  constructor(status: number, success: boolean, message: string, data?: unknown) {
    super(message, status);
    this.statusCode = status;
    this.success = success;
    this.message = message;
    this.data = data;
  }
}
