import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  Put,
  Query,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import {
  AssessmentResultDto,
  AssignQuizToUserRequestDto,
  CreateQuizRequestDto,
  GenQuizRequestDto,
  StudentAnswerDto,
  UpdateQuizDto,
} from './dto/assessment.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  OmitType,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { Answer, AssessmentResult, Quiz } from './models/assessment.models';
import { ObjectIdPipe } from 'src/common/pipe/objectid.pipe';
import { JwtAccessGuard } from 'src/auth/guards/jwt/jwt.access.guard';
import { Roles, RolesGuard } from 'src/auth/guards/role.guard';

@UseGuards(JwtAccessGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('Assessment')
@Controller('assessment')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post('quiz/create')
  @ApiOperation({ summary: 'Create quiz' })
  @ApiResponse({
    status: 201,
    schema: {
      type: 'object',
      properties: { message: { type: 'string', example: 'Quiz created' } },
    },
  })
  @Roles('Admin', 'Teacher')
  async createQuiz(@Body() request: CreateQuizRequestDto) {
    return { message: await this.assessmentService.createQuiz(request) };
  }

  @Get('quiz/ai/gen')
  @ApiOperation({ summary: 'Generate quiz with AI' })
  @ApiOkResponse({ type: OmitType(Quiz, ['id']) })
  async generateQuizAI(@Query() request: GenQuizRequestDto) {
    return await this.assessmentService.generateQuizAI(request);
  }

  @Get('quiz/findById/:quizId')
  @ApiOperation({ summary: 'Find quiz by id' })
  @ApiOkResponse({ type: Quiz })
  async findQuizById(@Param('quizId', new ObjectIdPipe()) quizId: string) {
    return await this.assessmentService.findQuizById(quizId);
  }

  @Get('quiz/findByUserId/:userId')
  @ApiOperation({ summary: 'Find quiz by user id' })
  @ApiOkResponse({ type: Quiz, isArray: true })
  async findQuizByUserId(@Param('userId', new ObjectIdPipe()) userId: string) {
    return await this.assessmentService.findQuizByUserId(userId);
  }

  @Put('quiz/update')
  @ApiOperation({ summary: 'Update quiz' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: { message: { type: 'string', example: 'Quiz updated' } },
    },
  })
  async updateQuiz(@Body() update: UpdateQuizDto) {
    return { message: await this.assessmentService.updateQuiz(update) };
  }

  @Delete('quiz/delete/:quizId')
  @ApiOperation({ summary: 'Delete quiz' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: { message: { type: 'string', example: 'Quiz deleted' } },
    },
  })
  @Roles('Teacher', 'Admin')
  async deleteQuiz(@Param('quizId', new ObjectIdPipe()) quizId: string) {
    return { message: await this.assessmentService.deleteQuiz(quizId) };
  }

  @Put('quiz/assign')
  @ApiOperation({ summary: 'Assign quiz to user' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Quiz assigned to user' },
      },
    },
  })
  @Roles('Admin', 'Teacher')
  async assignQuizToUser(@Body() request: AssignQuizToUserRequestDto) {
    return { message: await this.assessmentService.assignQuizToUser(request) };
  }

  @Post('result/ai/grade')
  @ApiOperation({
    summary: 'Grade quiz with AI - Does save result as Assessment Result',
  })
  @ApiResponse({
    status: 201,
    schema: {
      type: 'object',
      example: {
        rating: 10,
        comment:
          'Tuyệt vời! Bạn đã trả lời hoàn toàn chính xác. Kiến thức rất vững vàng! Tiếp tục phát huy nhé.',
      },
    },
  })
  async gradeQuizAI(@Body() request: StudentAnswerDto) {
    return await this.assessmentService.gradeQuizAI(request);
  }

  @Post('result/ai/grade/realtime')
  @ApiOperation({
    summary:
      "Grade quiz with AI (realtime chunk response in plain text) - Doesn't save result",
  })
  @ApiResponse({
    status: 201,
    schema: { type: 'string', example: 'Very well answered' },
  })
  async gradeQuizAIRealtime(@Res() res: Response, @Body() request: Answer) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.flushHeaders();
    const generator = await this.assessmentService.gradeQuizAIRealtime(request);

    for await (const chunk of generator) {
      const text = chunk;
      res.write(text);
    }

    res.end();
  }

  @Get('result/user/:studentId')
  @ApiOperation({ summary: 'Get assessment result' })
  @ApiOkResponse({ type: AssessmentResult, isArray: true })
  async getAssessResult(
    @Param('studentId', new ObjectIdPipe()) studentId: string,
  ) {
    return await this.assessmentService.getAssessResult(studentId);
  }

  @Delete('result/:assessResId')
  @ApiOperation({ summary: 'Delete assessment result' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Assessment result deleted' },
      },
    },
  })
  @Roles('Admin', 'Student')
  async deleteAssessResult(
    @Param('assessResId', new ObjectIdPipe()) assessResId: string,
  ) {
    return {
      message: await this.assessmentService.deleteAssessResult(assessResId),
    };
  }

  @Post('result/save')
  @ApiOperation({ summary: 'Save assessment result' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Assessment result saved' },
      },
    },
  })
  async saveAssessResult(@Body() assessRes: AssessmentResultDto) {
    return {
      message: await this.assessmentService.saveAssessResult(assessRes),
    };
  }
}
