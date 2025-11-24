import {
  Controller,
  Body,
  Get,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  OmitType,
} from '@nestjs/swagger';
import { ChangePasswordDto, UpdateUserDto, UserDto } from './dto/user.dto';
import { JwtAccessGuard } from 'src/auth/guards/jwt/jwt.access.guard';
import { ObjectIdPipe } from 'src/common/pipe/objectid.pipe';
import { Roles, RolesGuard } from 'src/auth/guards/role.guard';

@UseGuards(JwtAccessGuard, RolesGuard)
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('getAll')
  @ApiOperation({ summary: 'Get all users' })
  // @ApiOkResponse({ type: OmitType(UserDto, ['password']), isArray: true })
  @ApiOkResponse({ type: UserDto, isArray: true })
  @Roles('Admin')
  async getAll() {
    return await this.userService.getAll();
  }

  @Get('findById/:userId')
  @ApiOperation({ summary: 'Find user by id' })
  // @ApiOkResponse({ type: OmitType(UserDto, ['password']) })
  @ApiOkResponse({ type: UserDto })
  @Roles('Admin')
  async findById(@Param('userId', new ObjectIdPipe()) userId: string) {
    return await this.userService.findUserById(userId);
  }

  @Get('findByName/:username')
  @ApiOperation({ summary: 'Find user by username' })
  // @ApiOkResponse({ type: OmitType(UserDto, ['password']) })
  @ApiOkResponse({ type: UserDto })
  @Roles('Admin')
  async findByUsername(@Param('username') username: string) {
    return await this.userService.findUserByUsername(username);
  }

  @Get('self')
  @ApiOperation({ summary: 'Get user info' })
  @ApiOkResponse({ type: UserDto })
  async getSelf(@Req() req: any) {
    const userId = req.user.userId;
    return await this.userService.findUserById(userId);
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
  async changePassword(@Body() update: ChangePasswordDto) {
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

  @Delete('delete')
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
  async delete(@Req() req: any) {
    const userId = req.user.userId;
    return await this.userService.deleteUser(userId);
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
  @Roles('Admin')
  async deleteById(@Param('userId', new ObjectIdPipe()) userId: string) {
    return await this.userService.deleteUser(userId);
  }
}
