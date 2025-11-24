import {
  AssignQuizToUserRequestDto,
  CreateQuizRequestDto,
  GenQuizRequestDto,
  StudentAnswerDto,
  UpdateQuizDto,
} from './dto/assessment.dto';
import { Answer, AssessmentResult, Quiz } from './models/assessment.models';

export interface IAssessmentRepository {
  createQuiz(quiz: CreateQuizRequestDto): Promise<any>;
  generateQuizAI(request: GenQuizRequestDto): Promise<Quiz>;
  gradeQuizAI(request: StudentAnswerDto): Promise<AssessmentResult>;
  gradeQuizAIRealtime(request: Answer): Promise<AsyncGenerator | string>;
  findQuizById(quizId: string): Promise<Quiz | null>;
  findQuizByUserId(userId: string): Promise<Quiz[]>;
  updateQuiz(update: UpdateQuizDto): Promise<any>;
  deleteQuiz(quizId: string): Promise<any>;
  getAssessResult(studentId: string): Promise<AssessmentResult[]>;
  deleteAssessResult(assessResId: string): Promise<any>;
  saveAssessResult(assessRes: AssessmentResult): Promise<any>;
  assignQuizToUser(request: AssignQuizToUserRequestDto): Promise<any>;
}
