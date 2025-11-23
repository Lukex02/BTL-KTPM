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
} from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import {
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
import { Quiz } from './models/assessment.models';
import { ObjectIdPipe } from 'src/common/pipe/objectid.pipe';
import { JwtAccessGuard } from 'src/auth/guards/jwt/jwt.access.guard';

// @UseGuards(JwtAccessGuard)
// @ApiBearerAuth()
@ApiTags('Assessment (Quiz)')
@Controller('assessment')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create quiz' })
  @ApiResponse({
    status: 201,
    schema: {
      type: 'object',
      properties: { message: { type: 'string', example: 'Quiz created' } },
    },
  })
  async createQuiz(@Body() request: CreateQuizRequestDto) {
    return await this.assessmentService.createQuiz(request);
  }

  @Get('ai/gen')
  @ApiOperation({ summary: 'Generate quiz with AI' })
  @ApiOkResponse({ type: OmitType(Quiz, ['id']) })
  async generateQuizAI(@Query() request: GenQuizRequestDto) {
    return await this.assessmentService.generateQuizAI(request);
  }

  @Post('ai/grade')
  @ApiOperation({ summary: 'Grade quiz with AI' })
  @ApiResponse({
    status: 201,
    schema: { type: 'object', example: { message: 'Very well answered' } },
  })
  async gradeQuizAI(@Body() request: StudentAnswerDto) {
    return await this.assessmentService.gradeQuizAI(request);
  }

  @Post('ai/grade/realtime')
  @ApiOperation({ summary: 'Grade quiz with AI (realtime chunk response)' })
  @ApiResponse({
    status: 201,
    schema: { type: 'object', example: { message: 'Very well answered' } },
  })
  async gradeQuizAIRealtime(
    @Res() res: Response,
    @Body() request: StudentAnswerDto,
  ) {
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

  @Get('findById/:quizId')
  @ApiOperation({ summary: 'Find quiz by id' })
  @ApiOkResponse({ type: Quiz })
  async findQuizById(@Param('quizId', new ObjectIdPipe()) quizId: string) {
    return await this.assessmentService.findQuizById(quizId);
  }

  @Put('update/:quizId')
  @ApiOperation({ summary: 'Update quiz' })
  @ApiResponse({
    status: 201,
    schema: {
      type: 'object',
      properties: { message: { type: 'string', example: 'Quiz updated' } },
    },
  })
  async updateQuiz(
    @Param('quizId', new ObjectIdPipe()) quizId: string,
    @Body() update: UpdateQuizDto,
  ) {
    return await this.assessmentService.updateQuiz(quizId, update);
  }

  @Delete('delete/:quizId')
  @ApiOperation({ summary: 'Delete quiz' })
  @ApiResponse({
    status: 201,
    schema: {
      type: 'object',
      properties: { message: { type: 'string', example: 'Quiz deleted' } },
    },
  })
  async deleteQuiz(@Param('quizId', new ObjectIdPipe()) quizId: string) {
    return await this.assessmentService.deleteQuiz(quizId);
  }
}
