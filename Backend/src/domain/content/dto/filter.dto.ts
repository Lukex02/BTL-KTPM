import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsOptional, IsString } from 'class-validator';

export class FilterDto {
  @ApiProperty({
    description: 'Filter by tag',
    required: false,
    type: String,
  })
  @IsArray()
  @IsOptional()
  tag?: string[];

  @ApiProperty({
    description: 'Filter by type',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({
    description: 'Filter by from date',
    required: false,
    type: String,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  fromDate?: Date;

  @ApiProperty({
    description: 'Filter by to date',
    required: false,
    type: String,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  toDate?: Date;
}
