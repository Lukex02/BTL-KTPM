import {
  Controller,
  Body,
  Get,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ChangePasswordDto, UpdateUserDto, UserDto } from './dto/user.dto';
import { JwtAccessGuard } from 'src/auth/guards/jwt/jwt.access.guard';
import { ObjectIdPipe } from 'src/common/pipe/objectid.pipe';

@UseGuards(JwtAccessGuard)
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('findById/:userId')
  @ApiOperation({ summary: 'Find user by id' })
  @ApiOkResponse({ type: UserDto })
  async findById(@Param('userId', new ObjectIdPipe()) userId: string) {
    return await this.userService.findUserById(userId);
  }

  @Get('findByName/:username')
  @ApiOperation({ summary: 'Find user by username' })
  @ApiOkResponse({ type: UserDto })
  async findByUsername(@Param('username') username: string) {
    return await this.userService.findUserByUsername(username);
  }

  @Put('changePassword')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({
    status: 201,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Password changed successfully' },
      },
    },
  })
  async changePassword(
    @Param('userId', new ObjectIdPipe()) userId: string,
    @Body() update: ChangePasswordDto,
  ) {
    return await this.userService.changeUserPassword(update);
  }

  @Put('update')
  @ApiResponse({
    status: 201,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User updated' },
      },
    },
  })
  async update(
    @Param('userId', new ObjectIdPipe()) userId: string,
    @Body() update: UpdateUserDto,
  ) {
    return await this.userService.updateUser(update);
  }

  @Delete('delete/:userId')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({
    status: 201,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User deleted' },
      },
    },
  })
  async delete(@Param('userId', new ObjectIdPipe()) userId: string) {
    return await this.userService.deleteUser(userId);
  }
}
