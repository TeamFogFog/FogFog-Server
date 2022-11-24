import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserById(id: number): Promise<User> {
    const users = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    return users[0];
  }

  async getUserByKaKaoId(kakaoId: number): Promise<User> {
    const users = await this.prisma.user.findMany({
      where: {
        kakaoId,
      },
    });
    return users[0];
  }
}
