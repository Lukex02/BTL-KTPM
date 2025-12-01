import {
  GenQuizRequestDto,
  StudentAnswerDto,
} from 'src/domain/assessment/dto/assessment.dto';
import { Answer, Quiz } from 'src/domain/assessment/models/assessment.models';

export interface IAIService {
  MODEL: string;
  LANGUAGE: string;
  checkServiceOnline(): Promise<boolean>;
  generateQuiz(request: GenQuizRequestDto): Promise<Quiz>;
  gradeQuiz(
    request: StudentAnswerDto,
  ): Promise<{ rating: number; comment: string }>;
  gradeQuizRealtime(request: Answer[]): AsyncGenerator<string>;
}
