import { ApiProperty } from '@nestjs/swagger';

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
  question: string;

  @ApiProperty({
    description: 'Student answer',
    example: 'Paris',
    required: true,
  })
  answer: string | number;
}
