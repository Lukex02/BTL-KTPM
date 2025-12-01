import { Test } from '@nestjs/testing';
import { INestApplication, ExecutionContext, forwardRef } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';
import * as bcrypt from 'bcrypt';

import { UserController } from './user.controller';
import { MongoUserRepo } from './user.repository';
import {
  ChangeUserPassword,
  CreateUser,
  DeleteUser,
  FindUserById,
  FindUserByUsername,
  GetAll,
  FindUsersByRole,
  GetInChargeUsers,
  LinkTeacher,
  UnlinkTeacher,
  UpdateUser,
  UserService,
} from './user.service';
import { JwtAccessGuard } from 'src/auth/guards/jwt/jwt.access.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { AssessmentService } from '../assessment/assessment.service';

describe('UserController (integration with mongodb-memory-server)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;

  const validId = '507f1f77bcf86cd799439011';
  let seededId: string | undefined;
  let teacherId: string | undefined;

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
    const insertRes = await usersCol.insertMany([
      {
        username: 'john',
        email: 'john@example.com',
        password: await bcrypt.hash('hashedpass', 10),
        role: 'Student',
      },
      {
        username: 'mark',
        email: 'mark@example.com',
        password: await bcrypt.hash('hashedpass', 10),
        role: 'Teacher',
      },
    ]);
    seededId = insertRes.insertedIds[0].toString();
    teacherId = insertRes.insertedIds[1].toString();

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
        FindUsersByRole,
        GetInChargeUsers,
        LinkTeacher,
        UnlinkTeacher,
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

  it('PUT /user/changePassword -> changes user password and returns message', async () => {
    const payload = {
      userId: seededId,
      oldPassword: 'hashedpass',
      confirmNewPassword: 'newhashedpass',
      newPassword: 'newhashedpass',
    };

    const res = await request(app.getHttpServer())
      .put('/user/changePassword')
      .send(payload);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    // verify the password was changed
    const getRes = await request(app.getHttpServer()).get(
      `/user/findById/${seededId}`,
    );
    expect(getRes.status).toBe(200);
    expect(
      await bcrypt.compare(payload.newPassword, getRes.body.password),
    ).toBe(true);
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
    // verify update persisted by fetching the user
    const getRes = await request(app.getHttpServer()).get(
      `/user/findById/${payload.id}`,
    );
    expect(getRes.status).toBe(200);
    expect(getRes.body).toHaveProperty('email', 'johnny@example.com');
  });

  it('PUT /user/link -> links teacher to student and returns message', async () => {
    const payload = {
      studentId: seededId,
      teacherId: teacherId,
    };

    const res = await request(app.getHttpServer())
      .put('/user/link')
      .send(payload);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    // verify the teacher was linked to student
    const getStudentRes = await request(app.getHttpServer()).get(
      `/user/findById/${seededId}`,
    );
    expect(getStudentRes.status).toBe(200);
    expect(getStudentRes.body.teachersInCharge).toContain(teacherId);

    const getTeacherRes = await request(app.getHttpServer()).get(
      `/user/findById/${teacherId}`,
    );
    expect(getTeacherRes.status).toBe(200);
    expect(getTeacherRes.body.studentsInCharge).toContain(seededId);
  });

  it('GET /user/getInChargeUsers -> returns users in charge', async () => {
    const studentRes = await request(app.getHttpServer()).get(
      `/user/getInChargeUsers/${seededId}`,
    );
    expect(studentRes.status).toBe(200);
    expect(Array.isArray(studentRes.body)).toBe(true);
    expect(studentRes.body.length).toBeGreaterThan(0);
    // items should contain `id` and `username`
    expect(studentRes.body[0]).toHaveProperty('id');
    expect(studentRes.body[0]).toHaveProperty('username');
  });

  it('GET /user/findUsersByRole/:role -> returns users by role', async () => {
    const studentRes = await request(app.getHttpServer()).get(
      `/user/findUsersByRole/Student`,
    );
    expect(studentRes.status).toBe(200);
    expect(Array.isArray(studentRes.body)).toBe(true);
    expect(studentRes.body.length).toBeGreaterThan(0);
    // items should contain `id` and `username`
    expect(studentRes.body[0]).toHaveProperty('id', seededId);
    expect(studentRes.body[0]).toHaveProperty('username');

    const teacherRes = await request(app.getHttpServer()).get(
      `/user/findUsersByRole/Teacher`,
    );
    expect(teacherRes.status).toBe(200);
    expect(Array.isArray(teacherRes.body)).toBe(true);
    expect(teacherRes.body.length).toBeGreaterThan(0);
    // items should contain `id` and `username`
    expect(teacherRes.body[0]).toHaveProperty('id', teacherId);
    expect(teacherRes.body[0]).toHaveProperty('username');
  });

  it('PUT /user/unlink -> unlinks teacher from student and returns message', async () => {
    const payload = {
      studentId: seededId,
      teacherId: teacherId,
    };

    const res = await request(app.getHttpServer())
      .put('/user/unlink')
      .send(payload);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    // verify the teacher was unlinked from student
    const getStudentRes = await request(app.getHttpServer()).get(
      `/user/findById/${seededId}`,
    );
    expect(getStudentRes.status).toBe(200);
    expect(getStudentRes.body.teachersInCharge).not.toContain(teacherId);

    const getTeacherRes = await request(app.getHttpServer()).get(
      `/user/findById/${teacherId}`,
    );
    expect(getTeacherRes.status).toBe(200);
    expect(getTeacherRes.body.studentsInCharge).not.toContain(seededId);
  });

  it('DELETE /user/delete/:userId -> deletes current user and returns message', async () => {
    const res = await request(app.getHttpServer()).delete(
      `/user/delete/${seededId}`,
    );
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    // verify the user was removed
    const getRes = await request(app.getHttpServer()).get(
      `/user/findById/${seededId}`,
    );
    expect(getRes.status).toBe(404);
  });
});
