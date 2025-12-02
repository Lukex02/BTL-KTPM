import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

    if (!checkUser) return [];

    const baseFilter = Object.fromEntries(
      Object.entries(rest).filter(([_, v]) => v !== undefined),
    );
    const query =
      checkUser.role === 'Admin'
        ? baseFilter
        : {
            ...baseFilter,
            $or: [
              // 1. Content is assigned user
              {
                _id: {
                  $in: (checkUser?.assignedContentIds ?? []).map(
                    (id) => new ObjectId(id),
                  ),
                },
              },
              // 2. Content public
              { isPublic: true },
            ],
          };

    const data = await this.aggregate([
      { $match: query },
      // lookup creator
      {
        $lookup: {
          from: 'user',
          let: { creatorIdStr: '$creatorId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', { $toObjectId: '$$creatorIdStr' }] },
              },
            },
            { $project: { id: '$_id', _id: 0, username: 1, email: 1 } },
          ],
          as: 'creator',
        },
      },
      { $unwind: '$creator' },
      { $project: { creatorId: 0 } },
    ]);

    if (!data) return [];
    return data.map((item) => {
      const { _id, type, ...rest } = item;
      return { id: _id.toString(), ...rest } as ContentItem;
    });
  }

  async assignResource(
    resourceId: string,
    userId: string,
  ): Promise<UpdateResult> {
    const user = await this.UserService.findUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    const content = await this.findOne({ _id: new ObjectId(resourceId) });
    if (!content) throw new NotFoundException('Content not found');

    const userContent = await this.findOne(
      { _id: new ObjectId(userId), assignedContentIds: resourceId },
      'user',
    );

    if (userContent)
      throw new BadRequestException('Content already assigned to user');

    return await this.updateOne(
      { _id: new ObjectId(userId) },
      {
        $addToSet: {
          assignedContentIds: userId,
        },
      },
      'user',
    );
  }

  async uploadResource(
    resource: ArticleDto | LessonDto | VideoDto,
  ): Promise<InsertOneResult> {
    const res = await this.insertOne({
      ...resource,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.updateOne(
      { _id: new ObjectId(resource.creatorId) },
      {
        $addToSet: {
          assignedContentIds: res.insertedId,
        },
      },
    );
    return res;
  }

  async updateResource(
    resourceId: string,
    resource: ArticleDto | LessonDto | VideoDto,
  ): Promise<UpdateResult> {
    const { creatorId, ...rest } = resource;
    return await this.updateOne(
      { _id: new ObjectId(resourceId) },
      {
        $set: {
          ...rest,
          updatedAt: new Date(),
        },
      },
    );
  }

  async deleteResource(resourceId: string): Promise<DeleteResult> {
    return await this.deleteOne({ _id: new ObjectId(resourceId) });
  }
}
