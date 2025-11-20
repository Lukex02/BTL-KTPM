import { Module } from '@nestjs/common';
import { MongoUserRepo } from './user.repository';
import { Db } from 'mongodb';
import { MongoModule } from 'src/database/mongodb/mongodb.module';

@Module({
  imports: [MongoModule],
  // controllers: [],
  providers: [
    MongoUserRepo,
    {
      provide: 'IUserRepository',
      useClass: MongoUserRepo,
    },
    Db,
  ],
  exports: ['IUserRepository'],
})
export class UserModule {}
