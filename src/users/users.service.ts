import { Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { conflict, forbidden } from 'src/utils/error';
import { ResponseNicknameData } from './dto/response-nickname.dto';
import { UpdateNicknameDto } from './dto/update-nickname.dto';
import { UpdatePreferredMapDto } from './dto/update-preferredMap.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(newUser): Promise<User> {
    const user = await this.prisma.user.create({ data: newUser });
    return user;
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
        isDeleted: false,
      },
    });
    return user;
  }

  async getUserByKaKaoId(kakaoId: number): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        kakaoId,
        isDeleted: false,
      },
    });
    return user;
  }

  async getUserByAppleId(appleId: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        appleId,
        isDeleted: false,
      },
    });
    return user;
  }

  async getUserByNickname(nickname: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        nickname,
        isDeleted: false,
      },
    });
    return user;
  }

  async getNicknameByUserId(
    userId: number,
    id: number,
  ): Promise<ResponseNicknameData> {
    if (userId !== id) {
      throw forbidden();
    }
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
  }

  async updateRefreshTokenByUserId(
    id: number,
    refreshToken: string,
  ): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        refreshToken,
      },
    });
    return updatedUser;
  }

  async updateNicknameByUserId(
    userId: number,
    id: number,
    updateNicknameDto: UpdateNicknameDto,
  ): Promise<ResponseNicknameData> {
    if (userId !== id) {
      throw forbidden();
    }
    const { nickname } = updateNicknameDto;

    const existedUser = await this.getUserByNickname(nickname);
    if (existedUser && existedUser.id !== id) {
      throw conflict();
    }

    const updatedUser = await this.prisma.user.update({
      where: { id, isDeleted: false },
      data: {
        nickname: updateNicknameDto.nickname,
      },
    });

    return {
      nickname: updatedUser.nickname,
    };
  }

  async updatePreferredMapByUserId(
    userId: number,
    id: number,
    updatePreferredMapDto: UpdatePreferredMapDto,
  ): Promise<void> {
    if (userId !== id) {
      throw forbidden();
    }

    await this.prisma.user.update({
      where: { id, isDeleted: false },
      data: {
        preferredMap: updatePreferredMapDto.preferredMap,
      },
    });
  }
}
