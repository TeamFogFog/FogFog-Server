require('dotenv').config();

export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  sentryWebhookUrl: process.env.SENTRY_WEBHOOK_URL,
  sentryDsn: process.env.SENTRY_DSN,
  kakaoClientId: process.env.KAKAO_CLIENT_ID,
  kakaoRedirectUrl: process.env.KAKAO_REDIRECT_URL,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
});
