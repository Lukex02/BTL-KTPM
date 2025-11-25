import { Test } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';

import { ContentController } from './content.controller';
import {
  ContentService,
  GetResource,
  UploadResource,
  UpdateResource,
  DeleteResource,
} from './content.service';
import { MongoContentRepo } from './content.repository';
import { UserService } from '../user/user.service';
import { JwtAccessGuard } from 'src/auth/guards/jwt/jwt.access.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';

describe('ContentController (integration with mongodb-memory-server)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;
  let seededUserId: string;
  let uploadedIds: string[] = [];

  const mockJwtGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { userId: seededUserId };
      return true;
    },
  };

  const mockRolesGuard = { canActivate: () => true };

  // minimal mock UserService used by MongoContentRepo#getResource
  const mockUserService = {
    findUserById: jest.fn(async (userId: string) => ({
      id: userId,
      role: 'Admin',
      assignedContentIds: [],
    })),
  } as Partial<UserService>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('testdb');

    // seed a user (Admin to simplify permissions)
    const usersCol = db.collection('user');
    const insertRes = await usersCol.insertOne({
      username: 'tester',
      email: 'tester@example.com',
      password: 'pass',
      role: 'Admin',
      assignedContentIds: [],
    });
    seededUserId = insertRes.insertedId.toString();

    const moduleRef = await Test.createTestingModule({
      controllers: [ContentController],
      providers: [
        // content domain providers (replicates ContentModule providers)
        ContentService,
        GetResource,
        UploadResource,
        UpdateResource,
        DeleteResource,
        MongoContentRepo,
        { provide: 'ContentRepository', useClass: MongoContentRepo },
        // inject real DB connection for mongo repo
        { provide: 'MONGO_DB_CONN', useValue: db },
        // minimal UserService mock required by MongoContentRepo
        { provide: UserService, useValue: mockUserService },
      ],
    })
      .overrideGuard(JwtAccessGuard as any)
      .useValue(mockJwtGuard)
      .overrideGuard(RolesGuard as any)
      .useValue(mockRolesGuard)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await client.close();
    await mongod.stop();
  });

  beforeEach(() => {
    uploadedIds = [];
  });

  it('POST /content/upload -> uploads Article, Lesson, Video independently and returns insertedId', async () => {
    const article = {
      name: 'Article 1',
      type: 'article',
      tag: ['math'],
      isPublic: true,
      content: 'Article body',
    };

    const lesson = {
      name: 'Lesson 1',
      type: 'lesson',
      tag: ['science'],
      isPublic: false,
      content: 'Lesson body',
      difficulty: 'easy',
    };

    const video = {
      name: 'Video 1',
      type: 'video',
      tag: ['art'],
      isPublic: true,
      length: 60,
      format: 'mp4',
      link: 'https://example.com/v1.mp4',
    };

    const resA = await request(app.getHttpServer())
      .post('/content/upload')
      .send(article);
    expect(resA.status).toBe(201);
    expect(resA.body).toHaveProperty('message');
    expect(resA.body.message).toBe('Content uploaded');

    const resL = await request(app.getHttpServer())
      .post('/content/upload')
      .send(lesson);
    expect(resL.status).toBe(201);
    expect(resL.body).toHaveProperty('message');
    expect(resL.body.message).toBe('Content uploaded');

    const resV = await request(app.getHttpServer())
      .post('/content/upload')
      .send(video);
    expect(resV.status).toBe(201);
    expect(resV.body).toHaveProperty('message');
    expect(resV.body.message).toBe('Content uploaded');
  });

  it('GET /content/get -> returns uploaded content for Admin user', async () => {
    // ensure there is at least one content in DB (upload one)
    const sample = {
      name: 'GSample',
      type: 'article',
      tag: ['all'],
      isPublic: true,
      content: 'body',
    };
    await request(app.getHttpServer()).post('/content/upload').send(sample);

    const res = await request(app.getHttpServer()).get('/content/get');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    // items should contain `id` and `name`
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
  });

  it('PUT /content/update/:resourceId -> updates a resource and returns update result', async () => {
    const payload = {
      name: 'To Update',
      type: 'article',
      tag: ['u'],
      isPublic: true,
      content: 'before',
    };
    const getRes = await request(app.getHttpServer()).get('/content/get');
    const resourceId = getRes.body[0].id;

    const updateBody = { ...payload, name: 'Updated Name', content: 'after' };
    const res = await request(app.getHttpServer())
      .put(`/content/update/${resourceId}`)
      .send(updateBody);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Content updated');

    const getResAfter = await request(app.getHttpServer()).get('/content/get');
    expect(
      getResAfter.body.find((item: any) => item.id === resourceId).name,
    ).toEqual('Updated Name');
  });

  it('DELETE /content/delete/:resourceId -> deletes a resource and returns delete result', async () => {
    const payload = {
      name: 'To Delete',
      type: 'article',
      tag: ['d'],
      isPublic: true,
      content: 'delete-me',
    };
    const uploadRes = await request(app.getHttpServer())
      .post('/content/upload')
      .send(payload);
    expect(uploadRes.status).toBe(201);

    const getRes = await request(app.getHttpServer()).get('/content/get');
    const resourceId = getRes.body.find(
      (item: any) => item.name === 'To Delete',
    ).id;

    const res = await request(app.getHttpServer()).delete(
      `/content/delete/${resourceId}`,
    );
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Content deleted');

    const res2 = await request(app.getHttpServer()).get(
      `/content/get/${resourceId}`,
    );
    expect(res2.status).toBe(404);
  });
});
