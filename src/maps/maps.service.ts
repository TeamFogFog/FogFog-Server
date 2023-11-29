import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ResponseSmokingAreaData } from './dto/response-map.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import {
  ResponseSmokingAreas,
  ResponseSmokingAreasData,
} from './dto/response-maps.dto';
import { notFound } from 'src/utils/error';

@Injectable()
export class MapsService {
  constructor(
    private prisma: PrismaService,
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async getMapsByLatAndLong(
    lat: number,
    long: number,
  ): Promise<ResponseSmokingAreasData> {
    const latitude = lat.toFixed(6);
    const longitude = long.toFixed(6);

    const areas: ResponseSmokingAreas[] = await this.prisma
      .$queryRaw`SELECT id, latitude, longitude FROM ( SELECT id, latitude, longitude, (6371 * acos(cos(radians( ${latitude}::numeric ) ) * cos(radians(latitude)) * cos(radians(longitude) - radians(${longitude}::numeric)) + sin(radians(${latitude}::numeric)) * sin( radians(latitude)))) AS distance FROM "Map" ) DATA WHERE DATA.distance < 2`;

    const data: ResponseSmokingAreasData = {
      total: areas.length,
      areas,
    };

    return data;
  }

  async getMapById(
    mapId: number,
    lat: number,
    long: number,
  ): Promise<ResponseSmokingAreaData> {
    const map = await this.prisma.map.findUnique({
      where: {
        id: mapId,
        isDeleted: false,
      },
    });

    if (!map) {
      throw notFound();
    }

    const defaultImage = this.config.get('defaultImage');

    const { latitude: destinationLatitude, longitude: destinationLongitude } =
      map;

    const osrmRouteUrl = `http://router.project-osrm.org/route/v1/foot/${long},${lat};${destinationLongitude},${destinationLatitude}`;
    const osrmResponse = await firstValueFrom(this.http.get(osrmRouteUrl));
    const distance = `${osrmResponse.data.routes[0].distance}m` ?? '-m';

    const data: ResponseSmokingAreaData = {
      name: map.areaName,
      address: map.address,
      image: map.image ?? defaultImage,
      distance,
    };

    return data;
  }
}
