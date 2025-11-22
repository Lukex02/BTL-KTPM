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
import { JwtAccessGuard } from 'src/common/jwt/jwt.access.guard';
import { ObjectIdPipe } from 'src/common/pipe/objectid.pipe';

@UseGuards(JwtAccessGuard)
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/findById/:userId')
  @ApiOperation({ summary: 'Find user by id' })
  @ApiOkResponse({ type: UserDto })
  async findById(@Param('userId', new ObjectIdPipe()) userId: string) {
    return await this.userService.findUserById(userId);
  }

  @Get('/findByName/:username')
  @ApiOperation({ summary: 'Find user by username' })
  @ApiOkResponse({ type: UserDto })
  async findByUsername(@Param('username') username: string) {
    return await this.userService.findUserByUsername(username);
  }

  @Put('/changePassword/:userId')
  @ApiOperation({ summary: 'Change user password' })
  @ApiOkResponse({ schema: { type: 'string', example: 'Password changed' } })
  async changePassword(
    @Param('userId', new ObjectIdPipe()) userId: string,
    @Body() update: ChangePasswordDto,
  ) {
    return await this.userService.changeUserPassword(userId, update);
  }

  @Put('/update/:userId')
  @ApiOperation({ summary: 'Update user' })
  @ApiOkResponse({ schema: { type: 'string', example: 'User updated' } })
  async update(
    @Param('userId', new ObjectIdPipe()) userId: string,
    @Body() update: UpdateUserDto,
  ) {
    return await this.userService.updateUser(userId, update);
  }

  @Delete('/delete/:userId')
  @ApiOperation({ summary: 'Delete user' })
  @ApiOkResponse({ schema: { type: 'string', example: 'User deleted' } })
  async delete(@Param('userId', new ObjectIdPipe()) userId: string) {
    return await this.userService.deleteUser(userId);
  }
}
