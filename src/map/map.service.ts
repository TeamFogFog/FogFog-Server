import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ReadMapDto } from './read-map.dto';

// TODO: - dto 폴더링 어케, response 어케, 사이드바 api
@Injectable()
export class MapService {
  constructor(private prisma: PrismaService) {}

  async getMapById(
    mapId: number,
    lat: number,
    lang: number,
  ): Promise<ReadMapDto> {
    try {
      const map = await this.prisma.map.findUnique({
        where: {
          id: mapId,
        },
      });

      const destinationLatitude = map.latitude;
      const destinationLongitude = map.longitude;

      const data: ReadMapDto = {
        name: map.areaName,
        address: map.address,
        image: map.image,
        distance: '222m',
      };

      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
