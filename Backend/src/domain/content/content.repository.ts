import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { MongoDBRepo } from 'src/database/mongodb/mongodb.repository';
import { IContentRepository } from './interface/content.interface';
import {
  Db,
  DeleteResult,
  InsertOneResult,
  ObjectId,
  UpdateResult,
} from 'mongodb';
import { ContentItem } from './models/content.model';
import { FilterDto } from './dto/filter.dto';
import { UserService } from '../user/user.service';
import { ArticleDto, LessonDto, VideoDto } from './dto/content.dto';

@Injectable()
export class MongoContentRepo
  extends MongoDBRepo
  implements IContentRepository
{
  constructor(
    @Inject('MONGO_DB_CONN') db: Db,
    @Inject(forwardRef(() => UserService))
    private readonly UserService: UserService,
  ) {
    super(db, 'content'); // collectionName
  }

  async getResource(
    filter: FilterDto & { userId: string },
  ): Promise<ContentItem[]> {
    const { userId, ...rest } = filter;
    const checkUser = await this.UserService.findUserById(filter.userId);
    if (!checkUser || !checkUser.assignedContentIds) return [];

    const baseFilter = { ...rest };

    const query =
      checkUser.role === 'Admin'
        ? baseFilter
        : {
            ...baseFilter,
            $or: [
              // 1. Content is assigned user
              {
                _id: {
                  $in: checkUser.assignedContentIds.map(
                    (id) => new ObjectId(id),
                  ),
                },
              },
              // 2. Content public
              { isPublic: true },
            ],
          };

    const data = await this.findMany(query);

    if (!data) return [];
    return data.map((item) => {
      const { _id, type, ...rest } = item;
      return { id: _id.toString(), ...rest } as ContentItem;
    });
  }

  async uploadResource(
    resource: ArticleDto | LessonDto | VideoDto,
  ): Promise<InsertOneResult> {
    return await this.insertOne({
      ...resource,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async updateResource(
    resourceId: string,
    resource: ArticleDto | LessonDto | VideoDto,
  ): Promise<UpdateResult> {
    return await this.updateOne(
      { _id: new ObjectId(resourceId) },
      {
        $set: {
          ...resource,
          updatedAt: new Date(),
        },
      },
    );
  }

  async deleteResource(resourceId: string): Promise<DeleteResult> {
    return await this.deleteOne({ _id: new ObjectId(resourceId) });
  }
}
