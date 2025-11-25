import { Test } from '@nestjs/testing';
import { INestApplication, ExecutionContext, forwardRef } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';

import { UserController } from './user.controller';
import { MongoUserRepo } from './user.repository';
import {
  ChangeUserPassword,
  CreateUser,
  DeleteUser,
  FindUserById,
  FindUserByUsername,
  GetAll,
  UpdateUser,
  UserService,
} from './user.service';
import { JwtAccessGuard } from 'src/auth/guards/jwt/jwt.access.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { AssessmentService } from '../assessment/assessment.service';
import { AssessmentModule } from '../assessment/assessment.module';

describe('UserController (integration with mongodb-memory-server)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;

  const validId = '507f1f77bcf86cd799439011';
  let seededId: string | undefined;

  const mockAssessmentService = {
    getAssessResult: jest.fn().mockResolvedValue([]),
    deleteAssessResult: jest.fn().mockResolvedValue({}),
  } as unknown as Partial<AssessmentService>;

  const mockJwtGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      // Use the seeded id when available, otherwise fall back to validId
      req.user = { userId: seededId ?? validId };
      return true;
    },
  };

  const mockRolesGuard = { canActivate: () => true };

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('testdb');

    // seed a user document
    const usersCol = db.collection('user');
    const insertRes = await usersCol.insertOne({
      username: 'john',
      email: 'john@example.com',
      password: 'hashedpass',
      role: 'User',
    });
    seededId = insertRes.insertedId.toString();

    const moduleRef = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        MongoUserRepo,
        { provide: 'MONGO_DB_CONN', useValue: db },
        { provide: 'IUserRepository', useClass: MongoUserRepo },
        { provide: AssessmentService, useValue: mockAssessmentService },
        UserService,
        GetAll,
        FindUserById,
        FindUserByUsername,
        ChangeUserPassword,
        CreateUser,
        UpdateUser,
        DeleteUser,
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

  it('GET /user/getAll -> returns array of users', async () => {
    const res = await request(app.getHttpServer()).get('/user/getAll');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty('username', 'john');
  });

  it('GET /user/findByName/:username -> returns a user', async () => {
    const res = await request(app.getHttpServer()).get('/user/findByName/john');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('username', 'john');
  });

  it('GET /user/self -> returns current user (guard sets req.user)', async () => {
    const res = await request(app.getHttpServer()).get('/user/self');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('username', 'john');
  });

  it('PUT /user/update -> updates user and returns message', async () => {
    const payload = {
      username: 'john',
      email: 'johnny@example.com',
      id: undefined,
    };
    // find existing id first
    const list = await request(app.getHttpServer()).get('/user/getAll');
    payload.id = list.body[0].id;

    const res = await request(app.getHttpServer())
      .put('/user/update')
      .send(payload);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('DELETE /user/delete -> deletes current user and returns message', async () => {
    const res = await request(app.getHttpServer()).delete('/user/delete');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});
