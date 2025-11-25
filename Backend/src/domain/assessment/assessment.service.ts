import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IAssessmentRepository } from './assessment.interface';
import { Answer, AssessmentResult, Quiz } from './models/assessment.models';
import {
  AssignQuizToUserRequestDto,
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

  async execute(request: StudentAnswerDto): Promise<AssessmentResult> {
    return this.assessmentRepo.gradeQuizAI(request);
  }
}

@Injectable()
export class GradeQuizAIRealtime implements Command {
  constructor(
    @Inject('IAssessmentRepository')
    private readonly assessmentRepo: IAssessmentRepository,
  ) {}

  async execute(request: Answer): Promise<AsyncGenerator | string> {
    return this.assessmentRepo.gradeQuizAIRealtime(request);
  }
}

@Injectable()
export class FindQuizById implements Command {
  constructor(
    @Inject('IAssessmentRepository')
    private readonly assessmentRepo: IAssessmentRepository,
  ) {}

  async execute(quizId: string): Promise<Quiz> {
    const quiz = await this.assessmentRepo.findQuizById(quizId);
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }
}

@Injectable()
export class FindQuizByUserId implements Command {
  constructor(
    @Inject('IAssessmentRepository')
    private readonly assessmentRepo: IAssessmentRepository,
  ) {}

  async execute(userId: string): Promise<Quiz[]> {
    const quiz = await this.assessmentRepo.findQuizByUserId(userId);
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

@Injectable()
export class GetAssessResult implements Command {
  constructor(
    @Inject('IAssessmentRepository')
    private readonly assessmentRepo: IAssessmentRepository,
  ) {}

  async execute(studentId: string): Promise<AssessmentResult[]> {
    const res = await this.assessmentRepo.getAssessResult(studentId);
    if (!res) throw new NotFoundException('Assessment result not found');
    return res;
  }
}

@Injectable()
export class DeleteAssessResult implements Command {
  constructor(
    @Inject('IAssessmentRepository')
    private readonly assessmentRepo: IAssessmentRepository,
  ) {}

  async execute(assessResId: string): Promise<string> {
    const res = await this.assessmentRepo.deleteAssessResult(assessResId);
    if (res.deletedCount) {
      return 'Assessment result deleted';
    } else {
      throw new NotFoundException("Couldn't delete assessment result");
    }
  }
}

@Injectable()
export class SaveAssessResult implements Command {
  constructor(
    @Inject('IAssessmentRepository')
    private readonly assessmentRepo: IAssessmentRepository,
  ) {}

  async execute(assessRes: AssessmentResult): Promise<string> {
    return this.assessmentRepo.saveAssessResult(assessRes);
  }
}

@Injectable()
export class AssignQuizToUser implements Command {
  constructor(
    @Inject('IAssessmentRepository')
    private readonly assessmentRepo: IAssessmentRepository,
  ) {}

  async execute(request: AssignQuizToUserRequestDto): Promise<string> {
    const res = await this.assessmentRepo.assignQuizToUser(request);
    if (res.modifiedCount || res.matchedCount) {
      return 'Quiz assigned to user';
    } else {
      throw new NotFoundException(
        'No quiz update changed (quiz already assigned to user or update failed)',
      );
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
    private readonly FindQuizByUserId: FindQuizByUserId,
    private readonly UpdateQuiz: UpdateQuiz,
    private readonly DeleteQuiz: DeleteQuiz,
    private readonly GetAssessResult: GetAssessResult,
    private readonly DeleteAssessResult: DeleteAssessResult,
    private readonly SaveAssessResult: SaveAssessResult,
    private readonly AssignQuizToUser: AssignQuizToUser,
  ) {}

  async createQuiz(request: CreateQuizRequestDto): Promise<string> {
    return await this.CreateQuiz.execute(request);
  }

  async generateQuizAI(request: GenQuizRequestDto): Promise<Quiz> {
    return await this.GenerateQuizAI.execute(request);
  }

  async gradeQuizAI(
    request: StudentAnswerDto,
  ): Promise<{ rating: number; comment: string }> {
    const assRes = await this.GradeQuizAI.execute(request);
    await this.saveAssessResult({ ...assRes }); // Save a clone to db
    return { rating: assRes.rating, comment: assRes.comment };
  }

  async gradeQuizAIRealtime(request: Answer): Promise<AsyncGenerator | string> {
    return await this.GradeQuizAIRealtime.execute(request);
  }

  async findQuizById(quizId: string): Promise<Quiz> {
    return await this.FindQuizById.execute(quizId);
  }

  async findQuizByUserId(userId: string): Promise<Quiz[]> {
    return await this.FindQuizByUserId.execute(userId);
  }

  async updateQuiz(update: UpdateQuizDto): Promise<string> {
    return await this.UpdateQuiz.execute(update);
  }

  async deleteQuiz(quizId: string): Promise<string> {
    return await this.DeleteQuiz.execute(quizId);
  }

  async getAssessResult(studentId: string): Promise<AssessmentResult[]> {
    return await this.GetAssessResult.execute(studentId);
  }

  async deleteAssessResult(assessResId: string): Promise<string> {
    return await this.DeleteAssessResult.execute(assessResId);
  }

  async saveAssessResult(assessRes: AssessmentResult): Promise<string> {
    return await this.SaveAssessResult.execute(assessRes);
  }

  async assignQuizToUser(request: AssignQuizToUserRequestDto): Promise<string> {
    return await this.AssignQuizToUser.execute(request);
  }
}
