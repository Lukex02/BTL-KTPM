import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({
    description: 'Refresh token',
    type: 'string',
    required: true,
  })
  refreshToken: string;
}
