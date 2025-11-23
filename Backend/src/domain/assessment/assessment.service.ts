import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IAssessmentRepository } from './assessment.interface';
import { Quiz } from './models/assessment.models';
import {
  CreateQuizRequestDto,
  GenQuizRequestDto,
  StudentAnswerDto,
  UpdateQuizDto,
} from './dto/assessment.dto';

@Injectable()
export class CreateQuiz {
  constructor(
    @Inject('IAssessmentRepository')
    private readonly assessmentRepo: IAssessmentRepository,
  ) {}

  async execute(request: CreateQuizRequestDto): Promise<string> {
    const res = await this.assessmentRepo.createQuiz(request);
    if (res.insertedId) {
      return 'Quiz created';
    } else {
      throw new NotFoundException("Couldn't create quiz");
    }
  }
}

@Injectable()
export class GenerateQuizAI {
  constructor(
    @Inject('IAssessmentRepository')
    private readonly assessmentRepo: IAssessmentRepository,
  ) {}

  async execute(request: GenQuizRequestDto): Promise<Quiz> {
    return this.assessmentRepo.generateQuizAI(request);
  }
}

@Injectable()
export class GradeQuizAI {
  constructor(
    @Inject('IAssessmentRepository')
    private readonly assessmentRepo: IAssessmentRepository,
  ) {}

  async execute(request: StudentAnswerDto): Promise<string> {
    return this.assessmentRepo.gradeQuizAI(request);
  }
}

@Injectable()
export class GradeQuizAIRealtime {
  constructor(
    @Inject('IAssessmentRepository')
    private readonly assessmentRepo: IAssessmentRepository,
  ) {}

  async execute(request: StudentAnswerDto): Promise<AsyncGenerator | string> {
    return this.assessmentRepo.gradeQuizAIRealtime(request);
  }
}

@Injectable()
export class FindQuizById {
  constructor(
    @Inject('IAssessmentRepository')
    private readonly assessmentRepo: IAssessmentRepository,
  ) {}

  async execute(quizId: string): Promise<Quiz | null> {
    const quiz = await this.assessmentRepo.findQuizById(quizId);
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }
}

@Injectable()
export class UpdateQuiz {
  constructor(
    @Inject('IAssessmentRepository')
    private readonly assessmentRepo: IAssessmentRepository,
  ) {}

  async execute(quizId: string, update: UpdateQuizDto): Promise<string> {
    const res = await this.assessmentRepo.updateQuiz(quizId, update);
    if (res.modifiedCount || res.matchedCount) {
      return 'Quiz updated';
    } else {
      throw new NotFoundException("Couldn't update quiz");
    }
  }
}

@Injectable()
export class DeleteQuiz {
  constructor(
    @Inject('IAssessmentRepository')
    private readonly assessmentRepo: IAssessmentRepository,
  ) {}

  async execute(quizId: string): Promise<string> {
    const res = await this.assessmentRepo.deleteQuiz(quizId);
    if (res.deletedCount) {
      return 'Quiz deleted';
    } else {
      throw new NotFoundException("Couldn't delete quiz");
    }
  }
}

// Facade
@Injectable()
export class AssessmentService {
  constructor(
    private readonly CreateQuiz: CreateQuiz,
    private readonly GenerateQuizAI: GenerateQuizAI,
    private readonly GradeQuizAI: GradeQuizAI,
    private readonly GradeQuizAIRealtime: GradeQuizAIRealtime,
    private readonly FindQuizById: FindQuizById,
    private readonly UpdateQuiz: UpdateQuiz,
    private readonly DeleteQuiz: DeleteQuiz,
  ) {}

  async createQuiz(
    request: CreateQuizRequestDto,
  ): Promise<{ message: string }> {
    return { message: await this.CreateQuiz.execute(request) };
  }

  async generateQuizAI(request: GenQuizRequestDto): Promise<Quiz> {
    return await this.GenerateQuizAI.execute(request);
  }

  async gradeQuizAI(request: StudentAnswerDto): Promise<string> {
    return await this.GradeQuizAI.execute(request);
  }

  async gradeQuizAIRealtime(
    request: StudentAnswerDto,
  ): Promise<AsyncGenerator | string> {
    return await this.GradeQuizAIRealtime.execute(request);
  }

  async findQuizById(quizId: string): Promise<Quiz | null> {
    return await this.FindQuizById.execute(quizId);
  }

  async updateQuiz(
    quizId: string,
    update: UpdateQuizDto,
  ): Promise<{ message: string }> {
    return { message: await this.UpdateQuiz.execute(quizId, update) };
  }

  async deleteQuiz(quizId: string): Promise<{ message: string }> {
    return { message: await this.DeleteQuiz.execute(quizId) };
  }
}
