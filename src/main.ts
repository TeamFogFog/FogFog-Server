import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { setUpSwagger } from './utils/swagger';
import { GlobalExceptionFilter } from './exceptions/global.exception';
import * as Sentry from '@sentry/node';

require('dotenv').config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  });
  app.useGlobalPipes(new ValidationPipe({ disableErrorMessages: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());
  setUpSwagger(app);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
