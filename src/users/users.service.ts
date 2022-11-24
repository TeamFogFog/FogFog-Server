import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import CustomException from 'src/exceptions/custom.exception';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private readonly logger = new Logger(UsersService.name);

  async createUser(newUser) {
    try {
      const user = await this.prisma.user.create({ data: newUser });
      return user;
    } catch (error) {
      this.logger.error(error);
      throw new CustomException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Internal Server Error',
      );
    }
  }

  async getUserById(id: number): Promise<User> {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          id,
          isDeleted: false,
        },
      });
      return users[0];
    } catch (error) {
      this.logger.error(error);
      throw new CustomException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Internal Server Error',
      );
    }
  }

  async getUserByKaKaoId(kakaoId: number): Promise<User> {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          kakaoId,
          isDeleted: false,
        },
      });
      return users[0];
    } catch (error) {
      this.logger.error(error);
      throw new CustomException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Internal Server Error',
      );
    }
  }

  async updateRefreshTokenByUserId(id: number, refreshToken: string) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          refreshToken,
        },
      });
      return updatedUser;
    } catch (error) {
      this.logger.error(error);
      throw new CustomException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Internal Server Error',
      );
    }
  }
}
