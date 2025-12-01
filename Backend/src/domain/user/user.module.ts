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
  FindUsersByRole,
  GetAll,
  GetInChargeUsers,
  LinkTeacher,
  UnlinkTeacher,
  UpdateUser,
  UserService,
} from './user.service';
import { AuthModule } from 'src/auth/auth.module';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { AssessmentModule } from '../assessment/assessment.module';

@Module({
  imports: [
    MongoModule,
    forwardRef(() => AuthModule),
    forwardRef(() => AssessmentModule),
  ],
  controllers: [UserController],
  providers: [
    MongoUserRepo,
    Db,
    {
      provide: 'IUserRepository',
      useClass: MongoUserRepo,
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
    FindUsersByRole,
    GetInChargeUsers,
    LinkTeacher,
    UnlinkTeacher,
  ],
  exports: [UserService],
})
export class UserModule {}
