import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { mock, MockProxy } from 'jest-mock-extended';
import { PrismaService } from '../prisma.service';
import { UsersService } from './users.service';
import { UpdateNicknameDto } from './dto/update-nickname.dto';
import { UpdatePreferredMapDto } from './dto/update-preferredMap.dto';
import { forbidden } from '../utils/error';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: MockProxy<
    Pick<PrismaClient['user'], 'findUnique' | 'update' | 'create' | 'findFirst'>
  > = mock();
  const mockPrismaClient = {
    user: prisma,
  };
  const baseUser = {
    nickname: 'test',
    isDeleted: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaClient)
      .compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create user', () => {
    const newUser = {
      socialType: 1,
      nickname: 'test',
    };
    const createdUser = {
      ...newUser,
      id: 1,
    };
    it('생성할 user 객체가 주어지면 user를 생성하고 반환한다.', async () => {
      const mockCreate = prisma.create.mockResolvedValueOnce(
        createdUser as any,
      );

      const result = await service.createUser(newUser);

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith({
        data: newUser,
      });
      expect(result).toEqual(createdUser);
    });
  });

  describe('get user by user id', () => {
    const id: number = 1;
    const resultUser = {
      socialType: 1,
      id,
      ...baseUser,
    };

    it('존재하는 userId 가 주어지면, user 를 반환한다.', async () => {
      const mockFindUnique = prisma.findUnique.mockResolvedValueOnce(
        resultUser as any,
      );

      const result = await service.getUserById(id);

      expect(mockFindUnique).toHaveBeenCalledTimes(1);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: {
          id,
          isDeleted: false,
        },
      });
      expect(result).toEqual(resultUser);
    });
  });

  describe('get user by kakao id', () => {
    const kakaoId: number = 12345;
    const resultUser = {
      id: 1,
      socialType: 1,
      kakaoId,
      ...baseUser,
    };

    it('존재하는 kakaoId 가 주어지면, user 를 반환한다.', async () => {
      const mockFindFirst = prisma.findFirst.mockResolvedValueOnce(
        resultUser as any,
      );

      const result = await service.getUserByKaKaoId(kakaoId);

      expect(mockFindFirst).toHaveBeenCalledTimes(1);
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: {
          kakaoId,
          isDeleted: false,
        },
      });
      expect(result).toEqual(resultUser);
    });
  });

  describe('get user by apple id', () => {
    const appleId: string = 'test id';
    const resultUser = {
      id: 1,
      socialType: 2,
      appleId,
      ...baseUser,
    };

    it('존재하는 appleId 가 주어지면, user 를 반환한다.', async () => {
      const mockFindFirst = prisma.findFirst.mockResolvedValueOnce(
        resultUser as any,
      );

      const result = await service.getUserByAppleId(appleId);

      expect(mockFindFirst).toHaveBeenCalledTimes(2);
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: {
          appleId,
          isDeleted: false,
        },
      });
      expect(result).toEqual(resultUser);
    });
  });

  describe('get user nickname by user id', () => {
    it('서로 다른 userId 와 id 가 주어지면 forbidden 에러를 던진다.', () => {
      const userId: number = 1;
      const id: number = 2;

      const result = service.getNicknameByUserId(userId, id);

      expect(result).rejects.toThrowError(forbidden());
    });

    it('존재하는 userId 와 일치하는 id가 주어지면 유저 닉네임을 반환한다.', async () => {
      const userId: number = 1;
      const id: number = 1;

      const resultUser = {
        nickname: 'test',
      };

      const mockFindUnique = prisma.findUnique.mockResolvedValueOnce(
        resultUser as any,
      );

      const result = await service.getNicknameByUserId(userId, id);

      expect(mockFindUnique).toHaveBeenCalledTimes(2);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id, isDeleted: false },
        select: { nickname: true },
      });
      expect(result).toEqual(resultUser);
    });
  });

  describe('update nickname by user id', () => {
    const userId: number = 1;
    const updateNicknameDto: UpdateNicknameDto = {
      nickname: 'test',
    };

    it('서로 다른 userId 와 id 가 주어지면 forbidden 에러를 던진다.', () => {
      const id: number = 2;

      const result = service.updateNicknameByUserId(
        userId,
        id,
        updateNicknameDto,
      );

      expect(result).rejects.toThrowError(forbidden());
    });

    it('존재하는 userId 와 일치하는 id, 수정할 닉네임이 주어지면, 닉네임을 수정하고, 수정한 닉네임을 반환한다.', async () => {
      const id: number = 1;

      const mockUpdate = prisma.update.mockResolvedValueOnce(
        updateNicknameDto as any,
      );

      const result = await service.updateNicknameByUserId(
        userId,
        id,
        updateNicknameDto,
      );

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id, isDeleted: false },
        data: updateNicknameDto,
      });
      expect(result).toEqual(updateNicknameDto);
    });
  });

  describe('update refresh token by user id', () => {
    it('id, refresh token 이 주어지면 해당 id 유저의 refresh token 을 수정하고, 수정한 유저를 반환한다.', async () => {
      const id: number = 1;
      const refreshToken: string = 'test token';

      const resultUser = {
        sociayType: 1,
        id,
        refreshToken,
        ...baseUser,
      };

      const mockUpdate = prisma.update.mockResolvedValueOnce(resultUser as any);

      const result = await service.updateRefreshTokenByUserId(id, refreshToken);

      expect(mockUpdate).toHaveBeenCalledTimes(2);
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id },
        data: { refreshToken },
      });
      expect(result).toEqual(resultUser);
    });
  });

  describe('update preferred map by userId', () => {
    const userId: number = 1;
    const updatePreferredMapDto: UpdatePreferredMapDto = {
      preferredMap: 1,
    };
    const resultUser = {
      id: userId,
      preferredMap: updatePreferredMapDto.preferredMap,
      ...baseUser,
    };

    it('서로 다른 userId 와 id 가 주어지면 forbidden 에러를 던진다.', () => {
      const id: number = 2;

      const result = service.updatePreferredMapByUserId(
        userId,
        id,
        updatePreferredMapDto,
      );

      expect(result).rejects.toThrowError(forbidden());
    });

    it('존재하는 userId 와 일치하는 id, 수정할 선호지도가 주어지면, 유저의 선호지도를 수정한다.', async () => {
      const id: number = 1;

      const mockUpdate = prisma.update.mockResolvedValueOnce(resultUser as any);

      const result = await service.updatePreferredMapByUserId(
        userId,
        id,
        updatePreferredMapDto,
      );

      expect(mockUpdate).toHaveBeenCalledTimes(3);
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id, isDeleted: false },
        data: { preferredMap: updatePreferredMapDto.preferredMap },
      });
      expect(result).toEqual(undefined);
    });
  });
});
