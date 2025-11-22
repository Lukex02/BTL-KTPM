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
import { OllamaService } from 'src/common/AI/ollama.service';

@Module({
  imports: [MongoModule],
  controllers: [AssessmentController],
  providers: [
    MongoAssessmentRepo,
    Db,
    {
      provide: 'IAssessmentRepository',
      useClass: MongoAssessmentRepo,
    },
    OllamaService,
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
