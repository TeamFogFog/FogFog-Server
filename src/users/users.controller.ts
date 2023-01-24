import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards';
import { RESPONSE_MESSAGE } from 'src/common/objects';
import { wrapSuccess } from 'src/utils/success';
import { ReadNicknameParams } from './dto/read-nickname.dto';
import {
  ResponseNicknameData,
  ResponseNicknameDto,
} from './dto/response-nickname.dto';
import {
  UpdateNicknameDto,
  UpdateNicknameParams,
} from './dto/update-nickname.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AccessTokenGuard)
@ApiTags('Users')
@ApiBearerAuth('accessToken')
@ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
@ApiForbiddenResponse({
  description: 'Forbidden - 요청 id 와 accessToken 정보가 매치되지 않는 경우',
})
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id/nickname')
  @ApiOperation({
    summary: '유저 닉네임 조회 API',
    description: '유저 닉네임 조회',
  })
  @ApiParam({
    type: Number,
    name: 'id',
    required: true,
    description: 'user id',
  })
  @ApiOkResponse({ type: ResponseNicknameDto })
  async getNickname(
    @Req() req,
    @Param() { id }: ReadNicknameParams,
  ): Promise<ResponseNicknameDto> {
    const data: ResponseNicknameData =
      await this.usersService.getNicknameByUserId(req.user?.id, id);

    return wrapSuccess(
      HttpStatus.OK,
      RESPONSE_MESSAGE.READ_NICKNAME_SUCCESS,
      data,
    );
  }

  @Patch(':id/nickname')
  @ApiOperation({
    summary: '유저 닉네임 수정 API',
    description: '유저 닉네임 수정 (첫 회원가입 / 앱 내 닉네임 수정)',
  })
  @ApiParam({
    type: Number,
    name: 'id',
    required: true,
    description: 'user id',
  })
  @ApiOkResponse({ type: ResponseNicknameDto })
  async updateNickname(
    @Req() req,
    @Param() { id }: UpdateNicknameParams,
    @Body() updateNicknameDto: UpdateNicknameDto,
  ): Promise<ResponseNicknameDto> {
    const data: ResponseNicknameData =
      await this.usersService.updateNicknameByUserId(
        req.user?.id,
        id,
        updateNicknameDto,
      );

    return wrapSuccess(
      HttpStatus.OK,
      RESPONSE_MESSAGE.UPDATE_NICKNAME_SUCCESS,
      data,
    );
  }
}
