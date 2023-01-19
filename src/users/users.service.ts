import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import { RESPONSE_MESSAGE } from 'src/common/objects';
import CustomException from 'src/exceptions/custom.exception';
import { PrismaService } from 'src/prisma.service';
import { ResponseNicknameData } from './dto/response-nickname.dto';
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
      this.logger.error({ error });
      throw new CustomException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserById(id: number): Promise<User> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          id,
          isDeleted: false,
        },
      });
      return user;
    } catch (error) {
      this.logger.error({ error });
      throw new CustomException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserByKaKaoId(kakaoId: number): Promise<User> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          kakaoId,
          isDeleted: false,
        },
      });
      return user;
    } catch (error) {
      this.logger.error({ error });
      throw new CustomException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserByAppleId(appleId: string): Promise<User> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          appleId,
          isDeleted: false,
        },
      });
      return user;
    } catch (error) {
      this.logger.error({ error });
      throw new CustomException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR,
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
        RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateNicknameByUserId(
    userId: number,
    id: number,
    updateNicknameDto: UpdateNicknameDto,
  ): Promise<ResponseNicknameData> {
    if (userId !== id) {
      throw new CustomException(
        HttpStatus.FORBIDDEN,
        RESPONSE_MESSAGE.FORBIDDEN,
      );
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id, isDeleted: false },
        data: {
          nickname: updateNicknameDto.nickname,
        },
      });
      if (!updatedUser) {
        throw new CustomException(
          HttpStatus.NOT_FOUND,
          RESPONSE_MESSAGE.NOT_FOUND,
        );
      }

      return {
        nickname: updatedUser.nickname,
      };
    } catch (error) {
      this.logger.error({ error });
      throw new CustomException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
