import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({
    description: 'Refresh token',
    type: 'string',
    required: true,
  })
  @IsString()
  refreshToken: string;
}
