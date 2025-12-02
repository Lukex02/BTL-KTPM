import {
  Db,
  DeleteResult,
  InsertOneResult,
  ObjectId,
  UpdateResult,
} from 'mongodb';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IQuizRepository } from './interface/quiz.interface';
import { IAssessResultRepository } from './interface/result.interface';
import { MongoDBRepo } from 'src/database/mongodb/mongodb.repository';
import {
  GenQuizRequestDto,
  CreateQuizRequestDto,
  UpdateQuizDto,
  StudentAnswerDto,
  AssignQuizToUserRequestDto,
} from './dto/assessment.dto';
import { Answer, AssessmentResult, Quiz } from './models/assessment.models';
import { AIService } from 'src/common/AI/ai.service';
import { UserService } from 'src/domain/user/user.service';

@Injectable()
export class MongoQuizRepo extends MongoDBRepo implements IQuizRepository {
  constructor(
    @Inject('MONGO_DB_CONN') db: Db,
    @Inject('AI_SERVICE') private readonly AIService: AIService,
    @Inject(forwardRef(() => UserService))
    private readonly UserService: UserService,
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

  async gradeQuizAI(request: StudentAnswerDto): Promise<AssessmentResult> {
    const isAIServiceOpen = await this.AIService.checkServiceOnline(); // Check if AI service is open
    if (!isAIServiceOpen)
      // Dummy return
      return {
        studentId: request.studentId,
        quizId: request.quizId,
        rating: 10,
        comment:
          'Tuyệt vời! Bạn đã trả lời hoàn toàn chính xác. Kiến thức rất vững vàng! Tiếp tục phát huy nhé.',
        createdAt: new Date(),
      };
    // throw new InternalServerErrorException('AI service is not open');

    const grade = await this.AIService.gradeQuiz(request);
    return {
      studentId: request.studentId,
      quizId: request.quizId,
      ...grade,
      createdAt: new Date(),
    };
  }

  async gradeQuizAIRealtime(request: Answer): Promise<AsyncGenerator | string> {
    const isAIServiceOpen = await this.AIService.checkServiceOnline(); // Check if AI service is open
    if (!isAIServiceOpen)
      // Dummy return
      return 'Very well answered';
    // throw new InternalServerErrorException('AI service is not open');

    const gradeStream = this.AIService.gradeQuizRealtime([request]);
    return gradeStream;
  }

  async createQuiz(quiz: CreateQuizRequestDto): Promise<InsertOneResult> {
    const res = await this.insertOne(quiz, 'quiz');
    if (res.insertedId) {
      this.assignQuizToUser({
        quizId: res.insertedId.toString(),
        userId: quiz.userId,
      });
    }
    return res;
  }

  async findQuizById(quizId: string): Promise<Quiz | null> {
    // const quiz = await this.findOne({ _id: new ObjectId(quizId) }, 'quiz');
    const quiz = await this.aggregate(
      [
        {
          $match: {
            _id: new ObjectId(quizId),
          },
        },
        {
          $lookup: {
            from: 'user',
            let: { quizId: '$_id' },
            pipeline: [
              {
                $addFields: {
                  assignedQuizIdsObj: {
                    $map: {
                      input: { $ifNull: ['$assignedQuizIds', []] },
                      as: 'id',
                      in: { $toObjectId: '$$id' }, // convert string → ObjectId
                    },
                  },
                },
              },
              {
                $match: {
                  $expr: { $in: ['$$quizId', '$assignedQuizIdsObj'] },
                },
              },
              { $project: { id: '$_id', _id: 0, username: 1, email: 1 } },
            ],
            as: 'users',
          },
        },
        { $unwind: '$users' }, // chuyển array thành object
        { $addFields: { creator: '$users' } }, // đổi tên field
        { $project: { users: 0 } }, // bỏ field array cũ
      ],
      'quiz',
    );
    if (!quiz) return null;
    const { _id, ...rest } = quiz[0];
    return { id: _id.toString(), ...rest } as Quiz;
  }

  async findQuizByUserId(userId: string): Promise<Quiz[]> {
    const quizIdList = await this.UserService.findUserById(userId).then(
      (user) => user.assignedQuizIds?.map((id) => new ObjectId(id)),
    );
    if (!quizIdList || quizIdList.length === 0) return [];
    // const quizzes = await this.findMany({ _id: { $in: quizIdList } }, 'quiz');
    const quizzes = await this.aggregate(
      [
        {
          $match: {
            _id: { $in: quizIdList },
          },
        },
        {
          $lookup: {
            from: 'user',
            let: { quizId: '$_id' },
            pipeline: [
              {
                $addFields: {
                  assignedQuizIdsObj: {
                    $map: {
                      input: { $ifNull: ['$assignedQuizIds', []] },
                      as: 'id',
                      in: { $toObjectId: '$$id' }, // convert string → ObjectId
                    },
                  },
                },
              },
              {
                $match: {
                  $expr: { $in: ['$$quizId', '$assignedQuizIdsObj'] },
                },
              },
              { $project: { id: '$_id', _id: 0, username: 1, email: 1 } },
            ],
            as: 'users',
          },
        },
        { $unwind: '$users' }, // chuyển array thành object
        { $addFields: { creator: '$users' } }, // đổi tên field
        { $project: { users: 0 } }, // bỏ field array cũ
      ],
      'quiz',
    );
    if (!quizzes) return [];
    return quizzes.map((q) => {
      const { _id, ...rest } = q;
      return { id: _id.toString(), ...rest } as Quiz;
    });
  }

  async updateQuiz(update: UpdateQuizDto): Promise<UpdateResult> {
    const { quizId, ...updateBody } = update;
    return await this.updateOne(
      { _id: new ObjectId(quizId) },
      { $set: updateBody },
      'quiz',
    );
  }

  async deleteQuiz(quizId: string): Promise<DeleteResult> {
    await this.updateMany(
      { assignedQuizIds: quizId },
      { $pull: { assignedQuizIds: quizId } },
      'user',
    );
    return await this.deleteOne({ _id: new ObjectId(quizId) }, 'quiz');
  }

  async assignQuizToUser(
    request: AssignQuizToUserRequestDto,
  ): Promise<UpdateResult> {
    const { quizId, userId } = request;
    const user = await this.UserService.findUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    const quiz = await this.findOne({ _id: new ObjectId(quizId) }, 'quiz');
    if (!quiz) throw new NotFoundException('Quiz not found');

    const userQuiz = await this.findOne(
      { _id: new ObjectId(userId), assignedQuizIds: quizId },
      'user',
    );
    if (userQuiz)
      throw new BadRequestException('Quiz already assigned to user');

    return await this.updateOne(
      { _id: new ObjectId(userId) },
      { $addToSet: { assignedQuizIds: quizId } },
      'user',
    );
  }
}

@Injectable()
export class MongoAssessResultRepo
  extends MongoDBRepo
  implements IAssessResultRepository
{
  constructor(
    @Inject('MONGO_DB_CONN') db: Db,
    @Inject('AI_SERVICE') private readonly AIService: AIService,
  ) {
    super(db, 'assessment'); // collectionName for assessment results
  }

  async getAssessResult(studentId: string): Promise<AssessmentResult[]> {
    const assessRes = await this.findMany({ studentId });
    if (!assessRes) return [];
    return assessRes.map((res) => {
      const { _id, ...rest } = res;
      return { id: _id.toString(), ...rest } as AssessmentResult;
    });
  }

  async deleteAssessResult(assessResId: string): Promise<DeleteResult> {
    return await this.deleteOne({ _id: new ObjectId(assessResId) });
  }

  async saveAssessResult(
    assessRes: AssessmentResult,
  ): Promise<InsertOneResult> {
    return await this.insertOne(assessRes);
  }
}
