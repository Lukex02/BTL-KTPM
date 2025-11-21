import { Module } from '@nestjs/common';
import { MongoUserRepo } from './user.repository';
import { Db } from 'mongodb';
import { MongoModule } from 'src/database/mongodb/mongodb.module';
import { UserController } from './user.controller';
import {
  ChangeUserPassword,
  CreateUser,
  DeleteUser,
  FindUserById,
  FindUserByUsername,
  UpdateUser,
  UserService,
} from './user.service';

@Module({
  imports: [MongoModule],
  controllers: [UserController],
  providers: [
    MongoUserRepo,
    Db,
    {
      provide: 'IUserRepository',
      useClass: MongoUserRepo,
    },
    UserService,
    FindUserById,
    FindUserByUsername,
    ChangeUserPassword,
    CreateUser,
    UpdateUser,
    DeleteUser,
  ],
  exports: ['IUserRepository'],
})
export class UserModule {}
