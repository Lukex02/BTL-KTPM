import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { Creator } from 'src/domain/assessment/models/assessment.models';

export abstract class ContentItem {
  @ApiProperty({
    description: 'Content id',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({ description: 'Content name', example: 'Sample Article' })
  name: string;

  @ApiProperty({ description: 'Content tags', example: ['math', 'english'] })
  tag: string[];

  @ApiProperty({
    description: 'Creator',
    example: '507f1f77bcf86cd799439011',
  })
  creatorId: Creator;

  @ApiProperty({ description: 'Is content public', example: true })
  isPublic: boolean;

  @ApiProperty({
    description: 'Updated at',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  updatedAt: Date;

  @ApiProperty({
    description: 'Created at',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  createdAt: Date;
}

export class Article extends ContentItem {
  @ApiProperty({ description: 'Article content', example: 'Sample content' })
  content: string;
}

export class Video extends ContentItem {
  @ApiProperty({ description: 'Video length (s)', example: 10 })
  length: number;

  @ApiProperty({ description: 'Video format', example: 'mp4' })
  format: string;

  @ApiProperty({
    description: 'Video link',
    example: 'https://example.com/video.mp4',
  })
  link: string;
}

export class Lesson extends ContentItem {
  @ApiProperty({ description: 'Lesson content', example: 'Sample content' })
  content: string;

  @ApiProperty({ description: 'Lesson difficulty', example: 'easy' })
  difficulty: string;
}
