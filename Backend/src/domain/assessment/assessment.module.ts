import { Module } from '@nestjs/common';
import { AssessmentController } from './assessment.controller';
import {
  AssessmentService,
  CreateQuiz,
  DeleteQuiz,
  FindQuizById,
  GenerateQuizAI,
  GradeQuizAI,
  GradeQuizAIRealtime,
  UpdateQuiz,
} from './assessment.service';
import { MongoAssessmentRepo } from './assessment.repository';
import { Db } from 'mongodb';
import { MongoModule } from 'src/database/mongodb/mongodb.module';
import { AIModule } from 'src/common/AI/ai.module';

@Module({
  imports: [MongoModule, AIModule],
  controllers: [AssessmentController],
  providers: [
    MongoAssessmentRepo,
    Db,
    {
      provide: 'IAssessmentRepository',
      useClass: MongoAssessmentRepo,
    },
    AssessmentService,
    CreateQuiz,
    GenerateQuizAI,
    GradeQuizAI,
    GradeQuizAIRealtime,
    FindQuizById,
    UpdateQuiz,
    DeleteQuiz,
  ],
  exports: ['IAssessmentRepository'],
})
export class AssessmentModule {}
