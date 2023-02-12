import { Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import CustomException from 'src/exceptions/custom.exception';
import { PrismaService } from 'src/prisma.service';
import { forbidden, internalServerError, notFound } from 'src/utils/error';
import { ResponseNicknameData } from './dto/response-nickname.dto';
import { UpdateNicknameDto } from './dto/update-nickname.dto';
import { UpdatePreferredMapDto } from './dto/update-preferredMap.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private readonly logger = new Logger(UsersService.name);

  async createUser(newUser): Promise<User | CustomException> {
    try {
      const user = await this.prisma.user.create({ data: newUser });
      return user;
    } catch (error) {
      this.logger.error({ error });
      return internalServerError();
    }
  }

  async getUserById(id: number): Promise<User | CustomException> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id,
          isDeleted: false,
        },
      });
      return user;
    } catch (error) {
      this.logger.error({ error });
      return internalServerError();
    }
  }

  async getUserByKaKaoId(kakaoId: number): Promise<User | CustomException> {
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
      return internalServerError();
    }
  }

  async getUserByAppleId(appleId: string): Promise<User | CustomException> {
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
      return internalServerError();
    }
  }

  async getNicknameByUserId(
    userId: number,
    id: number,
  ): Promise<ResponseNicknameData | CustomException> {
    if (userId !== id) {
      return forbidden();
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id,
          isDeleted: false,
        },
        select: {
          nickname: true,
        },
      });

      return user;
    } catch (error) {
      this.logger.error(error);
      return internalServerError();
    }
  }

  async updateRefreshTokenByUserId(
    id: number,
    refreshToken: string,
  ): Promise<User | CustomException> {
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
      return internalServerError();
    }
  }

  async updateNicknameByUserId(
    userId: number,
    id: number,
    updateNicknameDto: UpdateNicknameDto,
  ): Promise<ResponseNicknameData | CustomException> {
    if (userId !== id) {
      return forbidden();
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id, isDeleted: false },
        data: {
          nickname: updateNicknameDto.nickname,
        },
      });
      if (!updatedUser) {
        return notFound();
      }

      return {
        nickname: updatedUser.nickname,
      };
    } catch (error) {
      this.logger.error({ error });
      return internalServerError();
    }
  }

  async updatePreferredMapByUserId(
    userId: number,
    id: number,
    updatePreferredMapDto: UpdatePreferredMapDto,
  ): Promise<void> {
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
          preferredMap: updatePreferredMapDto.preferredMap,
        },
      });
      if (!updatedUser) {
        throw new CustomException(
          HttpStatus.NOT_FOUND,
          RESPONSE_MESSAGE.NOT_FOUND,
        );
      }
    } catch (error) {
      this.logger.error({ error });
      throw new CustomException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
