import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssessmentModule } from 'src/domain/assessment/assessment.module';
import mongoDbConfig from 'src/database/mongodb/mongodb.config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './domain/user/user.module';
import { RolesGuard } from './auth/guards/role.guard';
import { AuthService } from './auth/auth.service';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mongoDbConfig],
    }),
    AssessmentModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
