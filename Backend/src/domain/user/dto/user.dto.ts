import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserDto {
  @ApiProperty({ description: 'User id', example: 'abcdef', required: false })
  @IsString()
  id?: string;

  @ApiProperty({
    description: 'User username',
    example: 'NgVanA',
    required: false,
  })
  @IsString()
  username?: string;

  @ApiProperty({
    description: 'User role',
    example: 'Student',
    required: false,
  })
  @IsString()
  role?: string;

  @ApiProperty({
    description: 'Password (hashed)',
    example: '$2abc$12$0$0$1234567890123456789012345678901234567890',
    required: false,
  })
  @IsString()
  password?: string;

  @ApiProperty({
    description: 'User name',
    example: 'NgVanA',
    required: false,
  })
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'User email',
    example: 'NgVanA',
    required: false,
  })
  @IsEmail()
  email?: string;

  @ApiProperty({
    description:
      '(For student) Assigned quiz ids - (For teacher) Created quiz ids',
    example: ['123456', 'abcdef'],
    required: false,
  })
  @IsArray()
  assignedQuizIds?: string[];
}

export class UpdateUserDto {
  @ApiProperty({ description: 'User id', example: 'abcdef', required: false })
  @IsString()
  id?: string;

  @ApiProperty({
    description: 'User name',
    example: 'NgVanA',
    required: false,
  })
  @IsString()
  username?: string;

  @ApiProperty({
    description: 'User role',
    example: 'Student',
    required: false,
  })
  @IsString()
  role?: string;

  @ApiProperty({
    description: 'User name',
    example: 'Nguyen Van A',
    required: false,
  })
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'User email',
    example: 'ngvana@gmail.com',
    required: false,
  })
  @IsEmail()
  email?: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'User id',
    example: 'NgVanA',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Old password',
    example: '123456',
    required: true,
  })
  @IsString()
  oldPassword: string;

  @ApiProperty({
    description: 'New password',
    example: '123456',
    required: true,
  })
  @IsString()
  newPassword: string;

  @ApiProperty({
    description: 'Confirm new password',
    example: '123456',
    required: true,
  })
  @IsString()
  confirmNewPassword: string;
}
