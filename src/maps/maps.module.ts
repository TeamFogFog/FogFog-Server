import { Module } from '@nestjs/common';
import { MapsController } from './maps.controller';
import { MapsService } from './maps.service';
import { PrismaService } from '../prisma.service';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [MapsController],
  providers: [MapsService, PrismaService, ConfigService],
})
export class MapsModule {}
