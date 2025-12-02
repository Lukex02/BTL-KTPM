import { ApiProperty } from '@nestjs/swagger';
import { Answer, Question } from '../models/assessment.models';
import {
  IsArray,
  IsMongoId,
  isMongoId,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsString,
} from 'class-validator';

export class StudentAnswerDto {
  @ApiProperty({ description: 'Quiz id', example: '0000', required: true })
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  quizId: string;

  @ApiProperty({ description: 'Student id', example: 'abcdef', required: true })
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  studentId: string;

  @ApiProperty({
    description: 'Student answers',
    required: true,
    type: Answer,
    isArray: true,
  })
  @IsNotEmpty()
  @IsArray()
  answers: Answer[];
}

export class GenQuizRequestDto {
  @ApiProperty({
    description: 'Topic',
    example: 'Math',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  topic: string;

  @ApiProperty({
    description: 'Question Type (multiple-choice | number | text)',
    example: 'multiple-choice',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Difficulty (easy | medium | hard)',
    example: 'easy',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  difficulty: string;

  @ApiProperty({
    description: 'Number of questions',
    example: 1,
    required: true,
  })
  @IsNumberString()
  numberOfQuestions: number;
}

export class CreateQuizRequestDto {
  @ApiProperty({
    description: 'Created user id',
    example: '0000',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Quiz title',
    example: 'Math Quiz',
    required: true,
    isArray: true,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Quiz description',
    example: 'Quiz description',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Quiz questions',
    required: true,
    type: Question,
    isArray: true,
  })
  @IsNotEmpty()
  @IsArray()
  questions: Question[];
}

export class UpdateQuizDto {
  @ApiProperty({ description: 'Quiz id', example: '0000', required: true })
  @IsNotEmpty()
  @IsString()
  quizId: string;

  @ApiProperty({
    description: 'Quiz title',
    example: 'Math Quiz',
    required: false,
  })
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Quiz description',
    example: 'Quiz description',
    required: false,
  })
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Quiz questions',
    required: false,
    type: Question,
    isArray: true,
  })
  @IsArray()
  questions?: Question[];
}

export class AssignQuizToUserRequestDto {
  @ApiProperty({
    description: 'Quiz id',
    example: '0000',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  quizId: string;

  @ApiProperty({
    description: 'User id',
    example: '1badfas3231',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class AssessmentResultDto {
  @ApiProperty({
    description: 'Student id',
    example: 'Math',
    required: true,
  })
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    description: 'Quiz id',
    example: 'Math',
    required: true,
  })
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  quizId: string;

  @ApiProperty({
    description: 'Rating',
    example: 10,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  rating: number;

  @ApiProperty({
    description: 'Assessment comment',
    example: 'This is the assessment comment',
    required: true,
  })
  @IsString()
  comment: string;
}
