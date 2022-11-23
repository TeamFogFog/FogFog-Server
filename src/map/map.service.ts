import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MapResponseDto } from './MapResponseDto';

@Injectable()
export class MapService {
  constructor(private prisma: PrismaService) {}

  async getMapById(
    mapId: number,
    lat: number,
    lang: number,
  ): Promise<MapResponseDto> {
    try {
      const map = await this.prisma.map.findUnique({
        where: {
          id: mapId,
        },
      });

      const data: MapResponseDto = {
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
