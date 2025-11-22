import {
  Db,
  DeleteResult,
  InsertOneResult,
  ObjectId,
  UpdateResult,
} from 'mongodb';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotImplementedException,
} from '@nestjs/common';
import { IAssessmentRepository } from '../assessment/assessment.interface';
import { MongoDBRepo } from 'src/database/mongodb/mongodb.repository';
import {
  GenQuizRequestDto,
  CreateQuizRequestDto,
  UpdateQuizDto,
  StudentAnswerDto,
} from './dto/assessment.dto';
import { Quiz } from './models/assessment.models';
import { OllamaService } from 'src/common/AI/ollama.service';
import { Readable } from 'stream';

@Injectable()
export class MongoAssessmentRepo
  extends MongoDBRepo
  implements IAssessmentRepository
{
  constructor(
    @Inject('MONGO_DB_CONN') db: Db,
    private readonly ollamaService: OllamaService,
  ) {
    super(db, 'assessment'); // collectionName
  }

  async generateQuizAI(request: GenQuizRequestDto): Promise<Quiz> {
    const isAIServiceOpen = await this.ollamaService.checkPort(
      '127.0.0.1',
      11434,
    ); // Check if ollama is open in default port
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

    const quiz = await this.ollamaService.generateQuiz(request);
    return quiz as Quiz;
  }

  async gradeQuizAI(request: StudentAnswerDto): Promise<any> {
    const isAIServiceOpen = this.ollamaService.checkPort('127.0.0.1', 11434); // Check if ollama is open in default port
    if (!isAIServiceOpen)
      // Dummy return
      return {
        message: 'Very well answered',
      };
    // throw new InternalServerErrorException('AI service is not open');

    const grade = await this.ollamaService.gradeQuiz(request);
    return { message: grade };
  }

  async gradeQuizAIRealtime(
    request: StudentAnswerDto,
  ): Promise<AsyncGenerator | { message: string }> {
    const isAIServiceOpen = this.ollamaService.checkPort('127.0.0.1', 11434); // Check if ollama is open in default port
    if (!isAIServiceOpen)
      // Dummy return
      return {
        message: 'Very well answered',
      };
    // throw new InternalServerErrorException('AI service is not open');

    const gradeStream = this.ollamaService.gradeQuizRealtime(request);
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

  async updateQuiz(
    quizId: string,
    update: UpdateQuizDto,
  ): Promise<UpdateResult> {
    return await this.updateOne(
      { _id: new ObjectId(quizId) },
      { $set: update },
    );
  }

  async deleteQuiz(quizId: string): Promise<DeleteResult> {
    return await this.deleteOne({ _id: new ObjectId(quizId) });
  }
}
