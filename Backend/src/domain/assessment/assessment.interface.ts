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
  gradeQuizAI(request: StudentAnswerDto): Promise<string>;
  gradeQuizAIRealtime(
    request: StudentAnswerDto,
  ): Promise<AsyncGenerator | string>;
  findQuizById(quizId: string): Promise<Quiz | null>;
  updateQuiz(update: UpdateQuizDto): Promise<any>;
  deleteQuiz(quizId: string): Promise<any>;
}
