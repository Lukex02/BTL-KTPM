import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IContentRepository } from './content.interface';
import { Command } from 'src/common/command';
import { Article, ContentItem, Lesson, Video } from './models/content.model';
import { FilterDto } from './dto/filter.dto';
import { ArticleDto, LessonDto, VideoDto } from './dto/content.dto';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

@Injectable()
export class GetResource implements Command {
  constructor(
    @Inject('ContentRepository')
    private readonly contentRepo: IContentRepository,
  ) {}

  async execute(
    filter: FilterDto & { userId: string },
  ): Promise<ContentItem[]> {
    return await this.contentRepo.getResource(filter);
  }
}

@Injectable()
export class UploadResource implements Command {
  constructor(
    @Inject('ContentRepository')
    private readonly contentRepo: IContentRepository,
  ) {}

  async execute(resource: ArticleDto | LessonDto | VideoDto): Promise<any> {
    const res = await this.contentRepo.uploadResource(resource);
    if (res.insertedId) {
      return 'Content uploaded';
    } else {
      throw new NotFoundException("Couldn't upload content");
    }
  }
}

@Injectable()
export class UpdateResource implements Command {
  constructor(
    @Inject('ContentRepository')
    private readonly contentRepo: IContentRepository,
  ) {}

  async execute(
    resourceId: string,
    resource: ArticleDto | LessonDto | VideoDto,
  ): Promise<any> {
    const res = await this.contentRepo.updateResource(resourceId, resource);
    if (res.matchedCount) {
      return 'Content updated';
    } else {
      throw new NotFoundException("Couldn't update content");
    }
  }
}

@Injectable()
export class DeleteResource implements Command {
  constructor(
    @Inject('ContentRepository')
    private readonly contentRepo: IContentRepository,
  ) {}

  async execute(resourceId: string): Promise<any> {
    const res = await this.contentRepo.deleteResource(resourceId);
    if (res.deletedCount) {
      return 'Content deleted';
    } else {
      throw new NotFoundException("Couldn't delete content");
    }
  }
}

@Injectable()
export class ContentService {
  constructor(
    private readonly GetResource: GetResource,
    private readonly UploadResource: UploadResource,
    private readonly UpdateResource: UpdateResource,
    private readonly DeleteResource: DeleteResource,
  ) {}

  private async convertContentItem<T extends object>(body: any): Promise<T> {
    let dtoClass;

    switch (body.type) {
      case 'article':
        dtoClass = ArticleDto;
        break;
      case 'lesson':
        dtoClass = LessonDto;
        break;
      case 'video':
        dtoClass = VideoDto;
        break;
      default:
        throw new BadRequestException('Invalid type');
    }

    const dto = plainToInstance<T, any>(dtoClass, body as object);
    await validateOrReject(dto);
    return dto;
  }

  async getResource(
    filter: FilterDto & { userId: string },
  ): Promise<ContentItem[]> {
    return await this.GetResource.execute(filter);
  }

  async uploadResource(resource: any): Promise<string> {
    return await this.UploadResource.execute(
      await this.convertContentItem<ArticleDto | LessonDto | VideoDto>(
        resource,
      ),
    );
  }

  async updateResource(resourceId: string, resource: any): Promise<string> {
    return await this.UpdateResource.execute(
      resourceId,
      await this.convertContentItem<ArticleDto | LessonDto | VideoDto>(
        resource,
      ),
    );
  }

  async deleteResource(resourceId: string): Promise<string> {
    return await this.DeleteResource.execute(resourceId);
  }
}
