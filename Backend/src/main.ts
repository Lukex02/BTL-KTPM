import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { initMongoDB } from './database/mongodb/mongodb.client';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  await initMongoDB(configService);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
