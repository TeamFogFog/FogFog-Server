import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './exceptions/global.exception';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebhookInterceptor } from './utils/webhook.interceptor';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: WebhookInterceptor,
    },
  ],
})
export class AppModule {}
