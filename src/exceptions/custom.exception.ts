import { HttpException } from "@nestjs/common";

export default class CustomException extends HttpException {
  public statusCode: number = 0;
  public message: string = '';
  public success: boolean = false;
  public data: any;

  constructor(status: number, success: boolean, message?: string, data?: any) {
    super(message, status);
    this.statusCode = status;
    this.success = success;
    this.message = message;
    this.data = data;
  }
}