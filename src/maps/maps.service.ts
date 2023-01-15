import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ResponseSmokingAreaData } from './dto/read-map.dto';
import { HttpService } from '@nestjs/axios';
import CustomException from 'src/exceptions/custom.exception';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import {
  ResponseSmokingAreas,
  ResponseSmokingAreasData,
} from './dto/read-maps.dto';

@Injectable()
export class MapsService {
  constructor(
    private prisma: PrismaService,
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  private readonly logger = new Logger(MapsService.name);

  async getMapsByLatAndLong(
    lat: number,
    long: number,
  ): Promise<ResponseSmokingAreasData> {
    try {
      const areas: ResponseSmokingAreas[] = await this.prisma
        .$queryRaw`SELECT id, latitude, longitude FROM ( SELECT id, latitude, longitude, (6371 * acos(cos(radians( ${lat} ) ) * cos(radians(latitude)) * cos(radians(longitude) - radians(${long})) + sin(radians(${lat})) * sin( radians(latitude)))) AS distance FROM "Map" ) DATA WHERE DATA.distance < 2`;

      const data: ResponseSmokingAreasData = {
        total: areas.length,
        areas,
      };

      return data;
    } catch (error) {
      this.logger.error({ error });
      throw new CustomException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Internal Server Error',
      );
    }
  }

  async getMapById(
    mapId: number,
    lat: number,
    long: number,
  ): Promise<ResponseSmokingAreaData> {
    try {
      const map = await this.prisma.map.findUnique({
        where: {
          id: mapId,
          isDeleted: false,
        },
      });

      if (!map) {
        throw new CustomException(HttpStatus.NOT_FOUND, 'Not Found - Map');
      }

      const defaultImage = this.config.get('DEFAULT_IMAGE');

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
    } catch (error) {
      this.logger.error({ error });
      throw new CustomException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Internal Server Error',
      );
    }
  }
}
