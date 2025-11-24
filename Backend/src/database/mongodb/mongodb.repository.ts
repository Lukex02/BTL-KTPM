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

  async findOne(
    filter: Document,
    specificCollection?: string,
  ): Promise<WithId<Document> | null> {
    const collection = this.db.collection(
      specificCollection ?? this.collectionName,
    );
    return await collection.findOne(filter);
  }

  async findMany(
    filter: Document,
    specificCollection?: string,
  ): Promise<WithId<Document>[] | null> {
    const collection = this.db.collection(
      specificCollection ?? this.collectionName,
    );
    return await collection.find(filter).toArray();
  }

  async insertOne(
    data: Document,
    specificCollection?: string,
  ): Promise<InsertOneResult<Document>> {
    const collection = this.db.collection(
      specificCollection ?? this.collectionName,
    );
    return await collection.insertOne(data);
  }

  async insertMany(
    data: Document[],
    specificCollection?: string,
  ): Promise<InsertManyResult<Document>> {
    const collection = this.db.collection(
      specificCollection ?? this.collectionName,
    );
    return await collection.insertMany(data);
  }

  async updateOne(
    filter: Document,
    update: Document,
    specificCollection?: string,
  ): Promise<UpdateResult<Document>> {
    const collection = this.db.collection(
      specificCollection ?? this.collectionName,
    );
    return await collection.updateOne(filter, update);
  }

  async updateMany(
    filter: Document,
    update: Document,
    specificCollection?: string,
  ): Promise<UpdateResult<Document>> {
    const collection = this.db.collection(
      specificCollection ?? this.collectionName,
    );
    return await collection.updateMany(filter, update);
  }

  async deleteOne(
    filter: Document,
    specificCollection?: string,
  ): Promise<DeleteResult> {
    const collection = this.db.collection(
      specificCollection ?? this.collectionName,
    );
    return await collection.deleteOne(filter);
  }

  async deleteMany(
    filter: Document,
    specificCollection?: string,
  ): Promise<DeleteResult> {
    const collection = this.db.collection(
      specificCollection ?? this.collectionName,
    );
    return await collection.deleteMany(filter);
  }
}
