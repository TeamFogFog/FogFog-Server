import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ReadMapDto } from './read-map.dto';
import { HttpService } from '@nestjs/axios';
import CustomException from 'src/exceptions/custom.exception';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MapService {
  constructor(
    private prisma: PrismaService,
    private readonly http: HttpService,
  ) {}

  private readonly logger = new Logger(MapService.name);

  async getMapById(
    mapId: number,
    lat: number,
    lang: number,
  ): Promise<ReadMapDto> {
    try {
      const map = await this.prisma.map.findUnique({
        where: {
          id: +mapId,
        },
      });

      if (!map) {
        throw new CustomException(HttpStatus.NOT_FOUND, 'Not Found - Map');
      }

      const destinationLatitude = map.latitude;
      const destinationLongitude = map.longitude;

      const osrmRouteUrl = `http://router.project-osrm.org/route/v1/driving/${lang},${lat};${destinationLongitude},${destinationLatitude}`;
      const osrmResponse = await firstValueFrom(this.http.get(osrmRouteUrl));
      const distance = `${osrmResponse.data.routes[0].distance}m`;

      const data: ReadMapDto = {
        name: map.areaName,
        address: map.address,
        image: map.image,
        distance: distance,
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
