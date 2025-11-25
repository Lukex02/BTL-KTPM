import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class Question {
  @ApiProperty({ description: 'Question id', example: 1, required: true })
  id: number;

  @ApiProperty({
    description: 'Question',
    example: 'What is the capital of France?',
    required: true,
  })
  question: string;

  @ApiProperty({
    description: 'Question type',
    example: 'text',
    required: true,
  })
  type: string;

  @ApiProperty({
    description: 'Question explanation',
    example: 'This is the question explanation (optional)',
    required: false,
  })
  questionExplanation?: string;

  @ApiProperty({
    description: 'Answer explanation',
    example: 'This is the answer explanation (optional)',
    required: false,
  })
  answerExplanation?: string;

  @ApiProperty({
    description: 'Correct answer',
    example: 'Paris (optional)',
    required: false,
  })
  correctAnswer?: string | number; // For multiple choice or number mostly
}

export class Quiz {
  @ApiProperty({ description: 'Quiz id', example: '0000', required: true })
  id: string;

  // @ApiProperty({ description: 'Quiz version', example: '1.0', required: true })
  // version: string;

  @ApiProperty({
    description: 'Quiz title',
    example: 'Math Quiz',
    required: true,
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

export class Answer {
  @ApiProperty({
    description: 'Question',
    example: "What's the capital of France?",
    required: true,
  })
  @IsString()
  question: string;

  @ApiProperty({
    description: 'Student answer',
    example: 'Paris',
    required: true,
  })
  answer: string | number;
}

export class AssessmentResult {
  @ApiProperty({
    description: 'Result id',
    example: '0000',
    required: true,
  })
  id?: string;

  @ApiProperty({
    description: 'Student id',
    example: 'Math',
    required: true,
  })
  studentId: string;

  @ApiProperty({
    description: 'Quiz id',
    example: 'Math',
    required: true,
  })
  quizId: string;

  @ApiProperty({
    description: 'Rating',
    example: 10,
    required: true,
  })
  rating: number;

  @ApiProperty({
    description: 'Assessment comment',
    example: 'This is the assessment comment',
    required: true,
  })
  comment: string;

  @ApiProperty({
    description: 'Created time',
    example: '12/12/2022',
    required: true,
  })
  createdAt: Date;
}
