import {
  Db,
  DeleteResult,
  InsertOneResult,
  ObjectId,
  UpdateResult,
} from 'mongodb';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IUserRepository } from '../user/user.interface';
import { MongoDBRepo } from 'src/database/mongodb/mongodb.repository';
import { User } from './models/user.models';
import { ChangePasswordDto, UpdateUserDto, UserDto } from './dto/user.dto';
import { AssessmentService } from 'src/domain/assessment/assessment.service';

@Injectable()
export class MongoUserRepo extends MongoDBRepo implements IUserRepository {
  constructor(
    @Inject('MONGO_DB_CONN') db: Db,
    @Inject(forwardRef(() => AssessmentService))
    private readonly AssessmentService: AssessmentService,
  ) {
    super(db, 'user'); // collectionName
  }

  async getAll(): Promise<UserDto[]> {
    const users = await this.findMany({});
    if (!users) return [];
    return users.map((user) => {
      const { _id, ...rest } = user;
      return { id: _id.toString(), ...rest } as UserDto;
    });
  }

  async findById(userId: string) {
    const user = await this.findOne({ _id: new ObjectId(userId) });
    if (!user) return null;
    const { _id, ...rest } = user;
    return { id: _id.toString(), ...rest } as UserDto;
  }

  async findByUsername(username: string) {
    const user = await this.findOne({ username });
    if (!user) return null;
    const { _id, ...rest } = user;
    return { id: _id.toString(), ...rest } as UserDto;
  }

  async changePassword(update: ChangePasswordDto): Promise<UpdateResult> {
    const { userId, oldPassword, newPassword, confirmNewPassword } = update;

    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.findOne({ _id: new ObjectId(userId) });
    if (!user) throw new NotFoundException('User not found');

    if (user.password !== oldPassword) {
      throw new UnauthorizedException('Old password is incorrect');
    }
    return await this.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: newPassword } },
    );
  }

  async createUser(user: User): Promise<InsertOneResult> {
    return await this.insertOne(user);
  }

  async updateUser(update: UpdateUserDto): Promise<UpdateResult> {
    const { id: userId, ...updateBody } = update;
    return await this.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateBody },
    );
  }

  async deleteUser(userId: string): Promise<DeleteResult> {
    (await this.AssessmentService.getAssessResult(userId)).map(async (res) => {
      if (res.id) await this.AssessmentService.deleteAssessResult(res.id);
    });
    return await this.deleteOne({ _id: new ObjectId(userId) });
  }
}
