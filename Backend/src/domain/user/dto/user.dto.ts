import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class UserDto {
  @ApiProperty({ description: 'User id', example: 'abcdef', required: false })
  @IsString()
  @IsMongoId()
  @Expose()
  id?: string;

  @ApiProperty({
    description: 'User username',
    example: 'NgVanA',
    required: false,
  })
  @IsString()
  @Expose()
  username?: string;

  @ApiProperty({
    description: 'User role',
    example: 'Student',
    required: false,
  })
  @IsString()
  @Expose()
  role?: string;

  @ApiProperty({
    description: 'Password (hashed)',
    example: '$2abc$12$0$0$1234567890123456789012345678901234567890',
    required: false,
  })
  @IsString()
  @Expose()
  password?: string;

  @ApiProperty({
    description: 'User name',
    example: 'NgVanA',
    required: false,
  })
  @IsString()
  @Expose()
  name?: string;

  @ApiProperty({
    description: 'User email',
    example: 'NgVanA',
    required: false,
  })
  @IsEmail()
  @Expose()
  email?: string;

  @ApiProperty({
    description:
      '(For student) Assigned quiz ids - (For teacher) Created quiz ids',
    example: ['123456', 'abcdef'],
    required: false,
  })
  @IsArray()
  @Expose()
  assignedQuizIds?: string[];

  @ApiProperty({
    description:
      '(For student) Assigned content ids - (For teacher) Created content ids',
    example: ['123456', 'abcdef'],
    required: false,
  })
  @IsArray()
  @Expose()
  assignedContentIds?: string[];

  @ApiProperty({
    description: '(For student) Assigned teacher ids',
    example: ['123456', 'abcdef'],
    required: false,
  })
  @IsArray()
  @Expose()
  teachersInCharge?: string[];

  @ApiProperty({
    description: '(For teacher) Assigned student ids',
    example: ['123456', 'abcdef'],
    required: false,
  })
  @IsArray()
  @Expose()
  studentsInCharge?: string[];
}

export class UpdateUserDto {
  @ApiProperty({ description: 'User id', example: 'abcdef', required: false })
  @IsString()
  @IsMongoId()
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
  @IsMongoId()
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

export class UserMinimumDto {
  @ApiProperty({
    description: 'User (Student/Teacher) id',
    example: '123456',
    required: true,
  })
  @IsString()
  @Expose()
  id: string;

  @ApiProperty({
    description: 'User (Student/Teacher) username',
    example: 'NgVanA',
    required: true,
  })
  @IsString()
  @Expose()
  username: string;

  @ApiProperty({
    description: 'User (Student/Teacher) name',
    example: 'Nguyễn Văn A',
    required: true,
  })
  @IsString()
  @Expose()
  name: string;

  @ApiProperty({ description: 'User (Student/Teacher) role', required: true })
  @IsString()
  @Expose()
  role: string;

  @ApiProperty({
    description: 'User (Student/Teacher) email',
    example: 'ngvana@gmail.com',
    required: true,
  })
  @IsEmail()
  @Expose()
  email: string;
}

export class LinkUserDto {
  @ApiProperty({
    description: 'Student id',
    example: '123456',
    required: true,
  })
  @IsString()
  @IsMongoId()
  studentId: string;

  @ApiProperty({
    description: 'Teacher id',
    example: '123456',
    required: true,
  })
  @IsString()
  @IsMongoId()
  teacherId: string;
}
