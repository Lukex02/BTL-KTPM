import {
  Db,
  DeleteResult,
  InsertOneResult,
  ObjectId,
  UpdateResult,
} from 'mongodb';
import { Inject, Injectable } from '@nestjs/common';
import { IAssessmentRepository } from '../assessment/assessment.interface';
import { MongoDBRepo } from 'src/database/mongodb/mongodb.repository';
import {
  GenQuizRequestDto,
  CreateQuizRequestDto,
  UpdateQuizDto,
  StudentAnswerDto,
} from './dto/assessment.dto';
import { Quiz } from './models/assessment.models';
import { AIRepository } from 'src/common/AI/ai.repository';

@Injectable()
export class MongoAssessmentRepo
  extends MongoDBRepo
  implements IAssessmentRepository
{
  constructor(
    @Inject('MONGO_DB_CONN') db: Db,
    @Inject('AI_SERVICE') private readonly AIService: AIRepository,
  ) {
    super(db, 'assessment'); // collectionName
  }

  async generateQuizAI(request: GenQuizRequestDto): Promise<Quiz> {
    const isAIServiceOpen = await this.AIService.checkServiceOnline(); // Check if AI service is open
    if (!isAIServiceOpen)
      // Dummy return
      return {
        title: 'Bài kiểm tra Cơ bản về Số học',
        description: 'Đánh giá kiến thức cơ bản về số học.',
        questions: [
          {
            id: 1,
            question: 'Số nguyên tố lớn nhất nhỏ hơn 10 là bao nhiêu?',
            type: 'multiple-choice',
            questionExplanation:
              'Giải thích vì sao 7 là số nguyên tố lớn nhất nhỏ hơn 10.',
            answerExplanation:
              'Số 7 có 2 ước số là 1 và chính nó. Các số 8, 9 đều có ước số ngoài 1 và chính nó.',
            correctAnswer: '7',
          },
        ],
      } as Quiz;
    // throw new InternalServerErrorException('AI service is not open');

    const quiz = await this.AIService.generateQuiz(request);
    return quiz;
  }

  async gradeQuizAI(request: StudentAnswerDto): Promise<string> {
    const isAIServiceOpen = await this.AIService.checkServiceOnline(); // Check if AI service is open
    if (!isAIServiceOpen)
      // Dummy return
      return 'Very well answered';
    // throw new InternalServerErrorException('AI service is not open');

    const grade = await this.AIService.gradeQuiz(request);
    return grade;
  }

  async gradeQuizAIRealtime(
    request: StudentAnswerDto,
  ): Promise<AsyncGenerator | string> {
    const isAIServiceOpen = await this.AIService.checkServiceOnline(); // Check if AI service is open
    if (!isAIServiceOpen)
      // Dummy return
      return 'Very well answered';
    // throw new InternalServerErrorException('AI service is not open');

    const gradeStream = this.AIService.gradeQuizRealtime(request);
    return gradeStream;
  }

  async createQuiz(quiz: CreateQuizRequestDto): Promise<InsertOneResult> {
    return await this.insertOne(quiz);
  }

  async findQuizById(quizId: string): Promise<Quiz | null> {
    const quiz = await this.findOne({ _id: new ObjectId(quizId) });
    if (!quiz) return null;
    const { _id, ...rest } = quiz;
    return { id: _id.toString(), ...rest } as Quiz;
  }

  async updateQuiz(update: UpdateQuizDto): Promise<UpdateResult> {
    const { quizId, ...updateBody } = update;
    return await this.updateOne(
      { _id: new ObjectId(quizId) },
      { $set: updateBody },
    );
  }

  async deleteQuiz(quizId: string): Promise<DeleteResult> {
    return await this.deleteOne({ _id: new ObjectId(quizId) });
  }
}
