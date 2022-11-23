export const wrapSuccess = (
  statusCode: number,
  message: string,
  data: unknown,
) => {
  return {
    success: true,
    statusCode,
    message,
    data,
  };
};
