import { forwardRef, Module } from '@nestjs/common';
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
  GetAll,
  UpdateUser,
  UserService,
} from './user.service';
import { AuthModule } from 'src/auth/auth.module';
import { RolesGuard } from 'src/auth/guards/role.guard';

@Module({
  imports: [MongoModule, forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [
    MongoUserRepo,
    Db,
    {
      provide: 'IUserRepository',
      useClass: MongoUserRepo,
    },
    {
      provide: 'UserService',
      useClass: UserService,
    },
    RolesGuard,
    UserService,
    GetAll,
    FindUserById,
    FindUserByUsername,
    ChangeUserPassword,
    CreateUser,
    UpdateUser,
    DeleteUser,
  ],
  exports: ['UserService'],
})
export class UserModule {}
