import { AssessmentResult } from '../models/assessment.models';

export interface IAssessResultRepository {
  getAssessResult(studentId: string): Promise<AssessmentResult[]>;
  deleteAssessResult(assessResId: string): Promise<any>;
  saveAssessResult(assessRes: AssessmentResult): Promise<any>;
}
