import {
  UseGuards,
  Controller,
  Get,
  Body,
  Param,
  Query,
  Req,
  Delete,
  Put,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { JwtAccessGuard } from 'src/auth/guards/jwt/jwt.access.guard';
import { Roles, RolesGuard } from 'src/auth/guards/role.guard';
import { ContentService } from './content.service';
import { FilterDto } from './dto/filter.dto';
import { ObjectIdPipe } from 'src/common/pipe/objectid.pipe';
import { Article, Lesson, Video } from './models/content.model';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import {
  ArticleDto,
  AssignContentDto,
  LessonDto,
  VideoDto,
} from './dto/content.dto';

const ContentSchema: SchemaObject = {
  oneOf: [
    { $ref: getSchemaPath(Article) },
    { $ref: getSchemaPath(Lesson) },
    { $ref: getSchemaPath(Video) },
  ],
};

const ContentSchemaDto: SchemaObject = {
  oneOf: [
    { $ref: getSchemaPath(ArticleDto) },
    { $ref: getSchemaPath(LessonDto) },
    { $ref: getSchemaPath(VideoDto) },
  ],
  discriminator: {
    propertyName: 'type',
    mapping: {
      article: getSchemaPath(ArticleDto),
      lesson: getSchemaPath(LessonDto),
      video: getSchemaPath(VideoDto),
    },
  },
};

@ApiExtraModels(Article, Lesson, Video, ArticleDto, LessonDto, VideoDto)
@UseGuards(JwtAccessGuard, RolesGuard)
@ApiBearerAuth()
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('get')
  @ApiOperation({ summary: 'Get content' })
  @ApiOkResponse({ schema: ContentSchema })
  async getResource(@Req() req: any, @Query() filter: FilterDto) {
    const userId = req.user.userId;
    return await this.contentService.getResource({ userId, ...filter });
  }

  @Put('assign')
  @Roles('Admin', 'Teacher')
  @ApiOperation({ summary: 'Assign content' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Content assigned' },
      },
    },
  })
  async assignResource(@Body() body: AssignContentDto) {
    return {
      message: await this.contentService.assignResource(
        body.contentId,
        body.userId,
      ),
    };
  }

  @Post('upload')
  @Roles('Admin', 'Teacher')
  @ApiOperation({ summary: 'Upload content' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Content uploaded' },
      },
    },
  })
  @ApiBody({ schema: ContentSchemaDto })
  async uploadResource(@Req() req: any, @Body() resource: any) {
    return {
      message: await this.contentService.uploadResource({
        ...resource,
        creatorId: req.user.userId,
      }),
    };
  }

  @Put('update/:resourceId')
  @Roles('Admin', 'Teacher')
  @ApiOperation({ summary: 'Update content' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Content updated' },
      },
    },
  })
  @ApiBody({ schema: ContentSchemaDto })
  async updateResource(
    @Param('resourceId', new ObjectIdPipe()) resourceId: string,
    @Body() body: any,
  ) {
    return {
      message: await this.contentService.updateResource(resourceId, body),
    };
  }

  @Delete('delete/:resourceId')
  @Roles('Admin', 'Teacher')
  @ApiOperation({ summary: 'Delete content' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Content deleted' },
      },
    },
  })
  async deleteResource(
    @Param('resourceId', new ObjectIdPipe()) resourceId: string,
  ) {
    return { message: await this.contentService.deleteResource(resourceId) };
  }
}
