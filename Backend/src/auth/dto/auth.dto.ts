import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Username',
    example: 'NgVanA',
    required: true,
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Password',
    example: '123456',
    required: true,
  })
  @IsString()
  password: string;
}

export class RegisterDto extends LoginDto {
  @ApiProperty({
    description: 'Role',
    example: 'Student',
    required: true,
  })
  @IsString()
  role: string;
}
