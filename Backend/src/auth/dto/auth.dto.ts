import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Username',
    example: 'NgVanA',
    required: true,
  })
  username: string;

  @ApiProperty({
    description: 'Password',
    example: '123456',
    required: true,
  })
  password: string;
}

export class RegisterDto extends LoginDto {
  @ApiProperty({
    description: 'Role',
    example: 'Student',
    required: true,
  })
  role: string;
}
