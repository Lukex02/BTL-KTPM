import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IAssessmentRepository } from './assessment.interface';
import { Quiz } from './models/assessment.models';
import {
  CreateQuizRequestDto,
  GenQuizRequestDto,
  StudentAnswerDto,
  UpdateQuizDto,
} from './dto/assessment.dto';
import { Command } from 'src/common/command';

@Injectable()
export class CreateQuiz implements Command {
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
export class GenerateQuizAI implements Command {
  constructor(
    @Inject('IAssessmentRepository')
    private readonly assessmentRepo: IAssessmentRepository,
  ) {}

  async execute(request: GenQuizRequestDto): Promise<Quiz> {
    return this.assessmentRepo.generateQuizAI(request);
  }
}

@Injectable()
export class GradeQuizAI implements Command {
  constructor(
    @Inject('IAssessmentRepository')
    private readonly assessmentRepo: IAssessmentRepository,
  ) {}

  async execute(request: StudentAnswerDto): Promise<string> {
    return this.assessmentRepo.gradeQuizAI(request);
  }
}

@Injectable()
export class GradeQuizAIRealtime implements Command {
  constructor(
    @Inject('IAssessmentRepository')
    private readonly assessmentRepo: IAssessmentRepository,
  ) {}

  async execute(request: StudentAnswerDto): Promise<AsyncGenerator | string> {
    return this.assessmentRepo.gradeQuizAIRealtime(request);
  }
}

@Injectable()
export class FindQuizById implements Command {
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
export class UpdateQuiz implements Command {
  constructor(
    @Inject('IAssessmentRepository')
    private readonly assessmentRepo: IAssessmentRepository,
  ) {}

  async execute(update: UpdateQuizDto): Promise<string> {
    const res = await this.assessmentRepo.updateQuiz(update);
    if (res.modifiedCount || res.matchedCount) {
      return 'Quiz updated';
    } else {
      throw new NotFoundException("Couldn't update quiz");
    }
  }
}

@Injectable()
export class DeleteQuiz implements Command {
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

  async updateQuiz(update: UpdateQuizDto): Promise<{ message: string }> {
    return { message: await this.UpdateQuiz.execute(update) };
  }

  async deleteQuiz(quizId: string): Promise<{ message: string }> {
    return { message: await this.DeleteQuiz.execute(quizId) };
  }
}
