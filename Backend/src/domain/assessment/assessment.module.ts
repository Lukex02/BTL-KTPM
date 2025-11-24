import { Module } from '@nestjs/common';
import { AssessmentController } from './assessment.controller';
import {
  AssessmentService,
  AssignQuizToUser,
  CreateQuiz,
  DeleteAssessResult,
  DeleteQuiz,
  FindQuizById,
  FindQuizByUserId,
  GenerateQuizAI,
  GetAssessResult,
  GradeQuizAI,
  GradeQuizAIRealtime,
  SaveAssessResult,
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
    GetAssessResult,
    FindQuizByUserId,
    DeleteAssessResult,
    SaveAssessResult,
    AssignQuizToUser,
  ],
  exports: ['IAssessmentRepository'],
})
export class AssessmentModule {}
