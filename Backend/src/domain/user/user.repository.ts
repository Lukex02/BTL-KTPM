import {
  Db,
  DeleteResult,
  InsertOneResult,
  ObjectId,
  UpdateResult,
} from 'mongodb';
import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '../user/user.interface';
import { MongoDBRepo } from 'src/database/mongodb/mongodb.repository';
import { User } from './models/user.models';

@Injectable()
export class MongoUserRepo extends MongoDBRepo implements IUserRepository {
  constructor(@Inject('DATABASE_CONNECTION') db: Db) {
    super(db, 'user'); // collectionName
  }

  async findById(userId: string): Promise<User | null> {
    const user = await this.findOne({ _id: new ObjectId(userId) });
    if (!user) return null;
    return new User(
      user._id.toString(),
      user.username,
      user.password,
      user.role,
    );
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.findOne({ username });
    if (!user) return null;
    return new User(
      user._id.toString(),
      user.username,
      user.password,
      user.role,
    );
  }

  async createUser(user: User): Promise<InsertOneResult> {
    return await this.insertOne(user);
  }

  async updateUser(userId: string, update: object): Promise<UpdateResult> {
    return await this.updateOne({ _id: new ObjectId(userId) }, update);
  }

  async deleteUser(userId: string): Promise<DeleteResult> {
    return await this.deleteOne({ _id: new ObjectId(userId) });
  }
}
