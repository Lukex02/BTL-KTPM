import { ApiProperty } from '@nestjs/swagger';
import { Answer, Question } from '../models/assessment.models';

export class StudentAnswerDto {
  @ApiProperty({ description: 'Quiz id', example: '0000', required: true })
  quizId: string;

  @ApiProperty({ description: 'Student id', example: 'abcdef', required: true })
  studentId: string;

  @ApiProperty({
    description: 'Student answers',
    required: true,
    type: Answer,
    isArray: true,
  })
  answers: Answer[];
}

export class GenQuizRequestDto {
  @ApiProperty({
    description: 'Topic',
    example: 'Math',
    required: true,
  })
  topic: string;

  @ApiProperty({
    description: 'Question Type (multiple-choice | number | text)',
    example: 'multiple-choice',
    required: true,
  })
  type: string;

  @ApiProperty({
    description: 'Difficulty (easy | medium | hard)',
    example: 'easy',
    required: true,
  })
  difficulty: string;

  @ApiProperty({
    description: 'Number of questions',
    example: 1,
    required: true,
  })
  numberOfQuestions: number;
}

export class CreateQuizRequestDto {
  @ApiProperty({
    description: 'Quiz title',
    example: 'Math Quiz',
    required: true,
    isArray: true,
  })
  title: string;

  @ApiProperty({
    description: 'Quiz description',
    example: 'Quiz description',
    required: true,
  })
  description: string;

  @ApiProperty({
    description: 'Quiz questions',
    required: true,
    type: Question,
    isArray: true,
  })
  questions: Question[];
}

export class UpdateQuizDto {
  @ApiProperty({ description: 'Quiz id', example: '0000', required: true })
  quizId: string;

  @ApiProperty({
    description: 'Quiz title',
    example: 'Math Quiz',
    required: false,
  })
  title?: string;

  @ApiProperty({
    description: 'Quiz description',
    example: 'Quiz description',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Quiz questions',
    required: false,
    type: Question,
    isArray: true,
  })
  questions?: Question[];
}

export class AssignQuizToUserRequestDto {
  @ApiProperty({
    description: 'Quiz id',
    example: '0000',
    required: true,
  })
  quizId: string;

  @ApiProperty({
    description: 'User id',
    example: '1badfas3231',
    required: true,
  })
  userId: string;
}
