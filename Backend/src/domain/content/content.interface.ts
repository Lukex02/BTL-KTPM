import { ArticleDto, LessonDto, VideoDto } from './dto/content.dto';
import { FilterDto } from './dto/filter.dto';
import { Article, ContentItem } from './models/content.model';

export interface IContentRepository {
  getResource(filter: FilterDto): Promise<ContentItem[]>;
  uploadResource(resource: ArticleDto | LessonDto | VideoDto): Promise<any>;
  updateResource(
    resourceId: string,
    resource: ArticleDto | LessonDto | VideoDto,
  ): Promise<any>;
  deleteResource(resourceId: string): Promise<any>;
}
