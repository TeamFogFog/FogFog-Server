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
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards';
import { wrapSuccess } from 'src/utils/success';
import {
  UpdateNicknameDto,
  UpdateNicknameParams,
} from './dto/update-nickname.dto';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AccessTokenGuard)
  @Patch(':id/nickname')
  @ApiOperation({
    summary: '유저 닉네임 수정 API',
    description: '유저 닉네임 수정 (첫 회원가입 / 앱 내 닉네임 수정)',
  })
  @ApiBearerAuth('accessToken')
  @ApiParam({
    type: Number,
    name: 'id',
    required: true,
    description: 'user id',
  })
  @ApiNoContentResponse()
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  async updateNickname(
    @Req() req,
    @Param() { id }: UpdateNicknameParams,
    @Body() updateNicknameDto: UpdateNicknameDto,
  ) {
    await this.usersService.updateNicknameByUserId(
      req.user?.id,
      id,
      updateNicknameDto,
    );

    return wrapSuccess(HttpStatus.NO_CONTENT);
  }
}
