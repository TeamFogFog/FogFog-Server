import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ResponseSmokingAreaData } from './dto/read-map.dto';
import { HttpService } from '@nestjs/axios';
import CustomException from 'src/exceptions/custom.exception';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MapsService {
  constructor(
    private prisma: PrismaService,
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  private readonly logger = new Logger(MapsService.name);

  async getMapById(
    mapId: number,
    lat: number,
    lang: number,
  ): Promise<ResponseSmokingAreaData> {
    try {
      const map = await this.prisma.map.findFirst({
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

      const osrmRouteUrl = `http://router.project-osrm.org/route/v1/driving/${lang},${lat};${destinationLongitude},${destinationLatitude}`;
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
