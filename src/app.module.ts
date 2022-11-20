import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { GlobalExceptionFilter } from './exceptions/global.exception';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MapModule } from './map/map.module';

@Module({
  imports: [MapModule],
  controllers: [AppController],
  providers: [AppService, { 
    provide: APP_FILTER, 
    useClass: GlobalExceptionFilter, 
  }],
})

export class AppModule {}
