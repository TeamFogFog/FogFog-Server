import {
  Body,
  Controller,
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
import { wrapSuccess } from 'src/utils/success';
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
export class UsersController {
  constructor(private usersService: UsersService) {}

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
  @ApiForbiddenResponse({
    description: 'Forbidden - 요청 id 와 accessToken 정보가 매치되지 않는 경우',
  })
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

    return wrapSuccess(HttpStatus.OK, '유저 닉네임 수정 성공', data);
  }
}
