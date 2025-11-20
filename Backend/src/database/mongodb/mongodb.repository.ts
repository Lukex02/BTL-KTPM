import {
  Db,
  DeleteResult,
  InsertManyResult,
  InsertOneResult,
  UpdateResult,
  WithId,
  Document,
} from 'mongodb';

export abstract class MongoDBRepo {
  constructor(
    protected db: Db,
    protected collectionName: string,
  ) {}

  async findOne(filter: Document): Promise<WithId<Document> | null> {
    console.log(this.db);
    const collection = this.db.collection(this.collectionName);
    return await collection.findOne(filter);
  }

  async insertOne(data: Document): Promise<InsertOneResult<Document>> {
    const collection = this.db.collection(this.collectionName);
    return await collection.insertOne(data);
  }

  async insertMany(data: Document[]): Promise<InsertManyResult<Document>> {
    const collection = this.db.collection(this.collectionName);
    return await collection.insertMany(data);
  }

  async updateOne(
    filter: Document,
    update: Document,
  ): Promise<UpdateResult<Document>> {
    const collection = this.db.collection(this.collectionName);
    return await collection.updateOne(filter, update);
  }

  async updateMany(
    filter: Document,
    update: Document,
  ): Promise<UpdateResult<Document>> {
    const collection = this.db.collection(this.collectionName);
    return await collection.updateMany(filter, update);
  }

  async deleteOne(filter: Document): Promise<DeleteResult> {
    const collection = this.db.collection(this.collectionName);
    return await collection.deleteOne(filter);
  }

  async deleteMany(filter: Document): Promise<DeleteResult> {
    const collection = this.db.collection(this.collectionName);
    return await collection.deleteMany(filter);
  }
}
