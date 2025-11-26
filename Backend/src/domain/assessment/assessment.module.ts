import { forwardRef, Module } from '@nestjs/common';
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
import { MongoQuizRepo, MongoAssessResultRepo } from './assessment.repository';
import { Db } from 'mongodb';
import { MongoModule } from 'src/database/mongodb/mongodb.module';
import { AIModule } from 'src/common/AI/ai.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongoModule,
    AIModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
  ],
  controllers: [AssessmentController],
  providers: [
    MongoQuizRepo,
    MongoAssessResultRepo,
    Db,
    {
      provide: 'IQuizRepository',
      useClass: MongoQuizRepo,
    },
    {
      provide: 'IAssessResultRepository',
      useClass: MongoAssessResultRepo,
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
  exports: [AssessmentService],
})
export class AssessmentModule {}
