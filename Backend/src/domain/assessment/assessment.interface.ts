import { Readable } from 'stream';
import {
  CreateQuizRequestDto,
  GenQuizRequestDto,
  StudentAnswerDto,
  UpdateQuizDto,
} from './dto/assessment.dto';
import { Quiz } from './models/assessment.models';

export interface IAssessmentRepository {
  createQuiz(quiz: CreateQuizRequestDto): Promise<any>;
  generateQuizAI(request: GenQuizRequestDto): Promise<Quiz>;
  gradeQuizAI(request: StudentAnswerDto): Promise<any>;
  gradeQuizAIRealtime(
    request: StudentAnswerDto,
  ): Promise<AsyncGenerator | { message: string }>;
  findQuizById(quizId: string): Promise<Quiz | null>;
  updateQuiz(quizId: string, update: UpdateQuizDto): Promise<any>;
  deleteQuiz(quizId: string): Promise<any>;
}
