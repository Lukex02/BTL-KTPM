import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssessmentModule } from 'src/domain/assessment/assessment.module';
import mongoDbConfig from 'src/database/mongodb/mongodb.config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mongoDbConfig],
    }),
    AssessmentModule,
    AuthModule,
  ],
})
export class AppModule {}
