import { Module, Global } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { initMongoDB } from './mongodb.client';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'MONGO_DB_CONN',
      useFactory: async (configService: ConfigService) =>
        await initMongoDB(configService),
      inject: [ConfigService],
    },
  ],
  exports: ['MONGO_DB_CONN'],
})
export class MongoModule {}
