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
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ChangePasswordDto, UpdateUserDto, UserDto } from './dto/user.dto';
import { JwtAccessGuard } from 'src/auth/guards/jwt/jwt.access.guard';

@UseGuards(JwtAccessGuard)
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/findById/:userId')
  @ApiOperation({ summary: 'Find user by id' })
  @ApiOkResponse({ type: UserDto })
  async findById(@Param('userId') userId: string) {
    return await this.userService.findById(userId);
  }

  @Get('/findByName/:username')
  @ApiOperation({ summary: 'Find user by username' })
  @ApiOkResponse({ type: UserDto })
  async findByUsername(@Param('username') username: string) {
    return await this.userService.findByUsername(username);
  }

  @Put('/changePassword/:userId')
  @ApiOperation({ summary: 'Change user password' })
  @ApiOkResponse({ schema: { type: 'string', example: 'Password changed' } })
  async changePassword(
    @Param('userId') userId: string,
    @Body() update: ChangePasswordDto,
  ) {
    return await this.userService.changePassword(userId, update);
  }

  @Put('/update/:userId')
  @ApiOperation({ summary: 'Update user' })
  @ApiOkResponse({ schema: { type: 'string', example: 'User updated' } })
  async update(@Param('userId') userId: string, @Body() update: UpdateUserDto) {
    return await this.userService.update(userId, update);
  }

  @Delete('/delete/:userId')
  @ApiOperation({ summary: 'Delete user' })
  @ApiOkResponse({ schema: { type: 'string', example: 'User deleted' } })
  async delete(@Param('userId') userId: string) {
    return await this.userService.delete(userId);
  }
}
