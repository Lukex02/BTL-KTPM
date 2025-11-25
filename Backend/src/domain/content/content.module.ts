import { forwardRef, Module } from '@nestjs/common';
import { Db } from 'mongodb';
import { MongoModule } from 'src/database/mongodb/mongodb.module';
import {
  ContentService,
  DeleteResource,
  GetResource,
  UpdateResource,
  UploadResource,
} from './content.service';
import { ContentController } from './content.controller';
import { MongoContentRepo } from './content.repository';
import { UserModule } from '../user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongoModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
  ],
  controllers: [ContentController],
  providers: [
    MongoContentRepo,
    Db,
    {
      provide: 'ContentRepository',
      useClass: MongoContentRepo,
    },
    ContentService,
    GetResource,
    UploadResource,
    UpdateResource,
    DeleteResource,
  ],
  exports: [ContentService],
})
export class ContentModule {}
