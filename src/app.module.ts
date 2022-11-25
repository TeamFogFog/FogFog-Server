import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { GlobalExceptionFilter } from './exceptions/global.exception';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MapController } from './map/map.controller';
import { MapService } from './map/map.service';
import { MapModule } from './map/map.module';
import { WebhookInterceptor } from './utils/webhook.interceptor';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';
import { PrismaService } from './prisma.service';
import { UsersModule } from './users/users.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    AuthModule,
    MapModule,
    HttpModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [configuration],
    }),
    UsersModule,
  ],
  controllers: [AppController, AuthController, MapController],
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
    AuthService,
    MapService,
    PrismaService,
    JwtService,
  ],
})
export class AppModule {}
