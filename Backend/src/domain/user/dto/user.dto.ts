import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ description: 'User id', example: 'abcdef', required: false })
  id?: string;

  @ApiProperty({
    description: 'User username',
    example: 'NgVanA',
    required: false,
  })
  username?: string;

  @ApiProperty({
    description: 'User role',
    example: 'Student',
    required: false,
  })
  role?: string;

  @ApiProperty({
    description: 'User name',
    example: 'NgVanA',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'User email',
    example: 'NgVanA',
    required: false,
  })
  email?: string;
}

export class UpdateUserDto {
  @ApiProperty({ description: 'User id', example: 'abcdef', required: false })
  id?: string;

  @ApiProperty({
    description: 'User name',
    example: 'NgVanA',
    required: false,
  })
  username?: string;

  @ApiProperty({
    description: 'User role',
    example: 'Student',
    required: false,
  })
  role?: string;

  @ApiProperty({
    description: 'User name',
    example: 'Nguyen Van A',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'User email',
    example: 'ngvana@gmail.com',
    required: false,
  })
  email?: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'User id',
    example: 'NgVanA',
    required: false,
  })
  userId: string;

  @ApiProperty({
    description: 'Old password',
    example: '123456',
    required: true,
  })
  oldPassword: string;

  @ApiProperty({
    description: 'New password',
    example: '123456',
    required: true,
  })
  newPassword: string;

  @ApiProperty({
    description: 'Confirm new password',
    example: '123456',
    required: true,
  })
  confirmNewPassword: string;
}
