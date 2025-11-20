import { MongoClient, Db } from 'mongodb';
import { ConfigService } from '@nestjs/config';

let db: Db | null;
let client: MongoClient | null;

export async function initMongoDB(configService: ConfigService): Promise<Db> {
  if (!db) {
    const uri = configService.get<string>('mongo.uri')!;
    const dbName = configService.get<string>('mongo.dbName')!;

    client = new MongoClient(uri);
    await client.connect();

    db = client.db(dbName);

    console.log(`MongoDB connected → ${dbName}`);
  }

  return db;
}

export function getMongoDB(): Db {
  if (!db) {
    throw new Error('MongoDB not initialized — call initMongoDB() first.');
  }
  return db;
}

export async function closeMongoDB() {
  if (client) {
    await client.close();
    db = null;
    client = null;
  }
}
