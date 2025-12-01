import { Test } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';
import * as bcrypt from 'bcrypt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { JwtRefreshGuard } from './guards/jwt/jwt.refresh.guard';
import { MongoUserRepo } from 'src/domain/user/user.repository';
import {
  FindUsersByRole,
  GetInChargeUsers,
  LinkTeacher,
  UnlinkTeacher,
  UserService,
} from 'src/domain/user/user.service';
import {
  GetAll,
  FindUserByUsername,
  CreateUser,
  FindUserById,
  ChangeUserPassword,
  UpdateUser,
  DeleteUser,
} from 'src/domain/user/user.service';
import { AssessmentService } from 'src/domain/assessment/assessment.service';

describe('AuthController (integration with mongodb-memory-server)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;
  let seededId: string;

  const mockJwtRefreshGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { refreshToken: 'refresh', userId: seededId };
      return true;
    },
  };

  const mockAssessmentService = {
    getAssessResult: jest.fn().mockResolvedValue([]),
    deleteAssessResult: jest.fn().mockResolvedValue({}),
  } as unknown as Partial<AssessmentService>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('testdb');

    // seed a user with hashed password for login
    const password = 'pass';
    const hashed = await bcrypt.hash(password, 10);
    const usersCol = db.collection('user');
    const insertRes = await usersCol.insertOne({
      username: 'alice',
      email: 'alice@example.com',
      password: hashed,
      role: 'User',
    });
    seededId = insertRes.insertedId.toString();

    const mockJwtService = {
      sign: jest.fn((payload: any, options: any) => {
        if (options && options.expiresIn === '15m') return 'access';
        return 'refresh';
      }),
      verify: jest.fn((token: string) => {
        if (token === 'refresh') return { userId: seededId, role: 'User' };
        return null;
      }),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: 'MONGO_DB_CONN', useValue: db },
        MongoUserRepo,
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
        FindUsersByRole,
        GetInChargeUsers,
        LinkTeacher,
        UnlinkTeacher,
        { provide: JwtService, useValue: mockJwtService },
      ],
    })
      .overrideGuard(JwtRefreshGuard as any)
      .useValue(mockJwtRefreshGuard)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await client.close();
    await mongod.stop();
  });

  it('POST /auth/register -> creates a user', async () => {
    const payload = { username: 'bob', password: 'bobpass', role: 'User' };
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: 'User created' });

    // verify user exists in DB
    const usersCol = db.collection('user');
    const user = await usersCol.findOne({ username: 'bob' });
    expect(user).toBeTruthy();
  });

  it('POST /auth/login -> returns tokens', async () => {
    const payload = { username: 'alice', password: 'pass' };
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(payload);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      access_token: 'access',
      refresh_token: 'refresh',
    });
  });

  it('POST /auth/refresh -> returns new access token', async () => {
    const res = await request(app.getHttpServer()).post('/auth/refresh');
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ access_token: 'access' });
  });
});
