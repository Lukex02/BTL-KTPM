import {
  GenQuizRequestDto,
  StudentAnswerDto,
} from 'src/domain/assessment/dto/assessment.dto';
import { Quiz } from 'src/domain/assessment/models/assessment.models';

export interface IAIRepository {
  MODEL: string;
  LANGUAGE: string;
  checkServiceOnline(): Promise<boolean>;
  generateQuiz(request: GenQuizRequestDto): Promise<Quiz>;
  gradeQuiz(request: StudentAnswerDto): Promise<string>;
  gradeQuizRealtime(request: StudentAnswerDto): AsyncGenerator<string>;
}
