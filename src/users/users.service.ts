import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import CustomException from 'src/exceptions/custom.exception';
import { PrismaService } from 'src/prisma.service';
import { UpdateNicknameDto } from './dto/update-nickname.dto';

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

  async updateNicknameByUserId(
    userId: number,
    id: number,
    updateNicknameDto: UpdateNicknameDto,
  ): Promise<void> {
    if (userId !== id) {
      throw new CustomException(HttpStatus.FORBIDDEN, 'Access Denied');
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id, isDeleted: false },
        data: {
          nickname: updateNicknameDto.nickname,
        },
      });
      if (!updatedUser) {
        throw new CustomException(HttpStatus.NOT_FOUND, 'User Not Found');
      }

      return;
    } catch (error) {
      this.logger.error({ error });
      throw new CustomException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Internal Server Error',
      );
    }
  }
}
