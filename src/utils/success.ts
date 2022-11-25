import { ResponseDataType } from 'src/common/types/response-data.type';

export const wrapSuccess = (
  statusCode: number,
  message: string,
  data: any,
) => {
  return {
    success: true,
    statusCode,
    message,
    data,
  };
};
