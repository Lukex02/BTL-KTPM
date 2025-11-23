import {
  Db,
  DeleteResult,
  InsertOneResult,
  ObjectId,
  UpdateResult,
} from 'mongodb';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IUserRepository } from '../user/user.interface';
import { MongoDBRepo } from 'src/database/mongodb/mongodb.repository';
import { User } from './models/user.models';
import { ChangePasswordDto, UpdateUserDto, UserDto } from './dto/user.dto';

@Injectable()
export class MongoUserRepo extends MongoDBRepo implements IUserRepository {
  constructor(@Inject('MONGO_DB_CONN') db: Db) {
    super(db, 'user'); // collectionName
  }

  async getUserPasswordByUsername(username: string) {
    const user = await this.findOne({ username });
    if (!user) return null;
    return { userId: user._id.toString(), password: user.password };
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

  async changePassword(
    userId: string,
    update: ChangePasswordDto,
  ): Promise<UpdateResult> {
    const { oldPassword, newPassword, confirmNewPassword } = update;

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

  async updateUser(
    userId: string,
    update: UpdateUserDto,
  ): Promise<UpdateResult> {
    return await this.updateOne(
      { _id: new ObjectId(userId) },
      { $set: update },
    );
  }

  async deleteUser(userId: string): Promise<DeleteResult> {
    return await this.deleteOne({ _id: new ObjectId(userId) });
  }
}
