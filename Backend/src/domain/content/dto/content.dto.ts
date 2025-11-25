import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export abstract class ContentItemDto {
  @ApiProperty({ description: 'Content name', example: 'Sample Article' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Content type', example: 'article' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Content tags', example: ['math', 'english'] })
  @IsArray()
  tag: string[];

  @ApiProperty({ description: 'Is content public', example: true })
  @IsBoolean()
  isPublic: boolean;
}

export class ArticleDto extends ContentItemDto {
  @ApiProperty({ description: 'Article content', example: 'Sample content' })
  @IsString()
  content: string;
}

export class VideoDto extends ContentItemDto {
  @ApiProperty({ description: 'Video length (s)', example: 10 })
  @IsNumber()
  length: number;

  @ApiProperty({ description: 'Video format', example: 'mp4' })
  @IsString()
  format: string;

  @ApiProperty({
    description: 'Video link',
    example: 'https://example.com/video.mp4',
  })
  @IsUrl()
  link: string;
}

export class LessonDto extends ContentItemDto {
  @ApiProperty({ description: 'Lesson content', example: 'Sample content' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Lesson difficulty', example: 'easy' })
  @IsString()
  difficulty: string;
}
