import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setUpSwagger } from './utils/swagger';
import { GlobalExceptionFilter } from './exceptions/global.exception';

require('dotenv').config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalExceptionFilter());
  setUpSwagger(app);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
