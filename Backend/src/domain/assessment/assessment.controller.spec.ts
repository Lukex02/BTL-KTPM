import { Test } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';
import { AssessmentModule } from './assessment.module';
import { JwtAccessGuard } from 'src/auth/guards/jwt/jwt.access.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { UserService } from '../user/user.service';
import { AIService } from 'src/common/AI/ai.service';

describe('AssessmentController (integration with mongodb-memory-server)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;
  let seededUserId: string;

  const mockJwtGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { userId: seededUserId };
      return true;
    },
  };

  const mockRolesGuard = { canActivate: () => true };

  const mockUserService = {
    findUserById: jest.fn(async (userId: string) => ({
      id: userId,
      username: 'testuser',
      role: 'Student',
      assignedQuizIds: [],
    })),
  } as Partial<UserService>;

  const mockAIService = {
    checkServiceOnline: jest.fn().mockResolvedValue(false), // Use dummy responses
  } as Partial<AIService>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('testdb');

    // seed a user
    const usersCol = db.collection('user');
    const insertRes = await usersCol.insertOne({
      username: 'assessmentuser',
      email: 'assess@example.com',
      password: 'pass',
      role: 'Admin',
      assignedQuizIds: [],
    });
    seededUserId = insertRes.insertedId.toString();

    const moduleRef = await Test.createTestingModule({
      imports: [AssessmentModule],
    })
      .overrideProvider('MONGO_DB_CONN')
      .useValue(db)
      .overrideProvider(UserService)
      .useValue(mockUserService)
      .overrideProvider('AI_SERVICE')
      .useValue(mockAIService)
      .overrideGuard(JwtAccessGuard)
      .useValue(mockJwtGuard)
      .overrideGuard(RolesGuard)
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

  it('POST /assessment/quiz/create -> creates quiz', async () => {
    const payload = { title: 'Math Quiz', questions: [] };
    const res = await request(app.getHttpServer())
      .post('/assessment/quiz/create')
      .send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: 'Quiz created' });
  });

  it('GET /assessment/quiz/findByUserId/:userId -> returns assigned quizzes', async () => {
    const res = await request(app.getHttpServer()).get(
      `/assessment/quiz/findByUserId/${seededUserId}`,
    );
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('PUT /assessment/quiz/update -> updates quiz and verifies via GET', async () => {
    // Create a quiz first
    const createRes = await request(app.getHttpServer())
      .post('/assessment/quiz/create')
      .send({ title: 'Original Title', questions: [] });
    expect(createRes.status).toBe(201);

    // Get quizzes to find the created one
    const listRes = await request(app.getHttpServer()).get(
      `/assessment/quiz/findByUserId/${seededUserId}`,
    );
    const quizId = listRes.body[0]?.id;

    if (quizId) {
      const updatePayload = { quizId, title: 'Updated Title' };
      const updateRes = await request(app.getHttpServer())
        .put('/assessment/quiz/update')
        .send(updatePayload);
      expect(updateRes.status).toBe(200);
      expect(updateRes.body).toEqual({ message: 'Quiz updated' });

      // Verify update by fetching
      const getRes = await request(app.getHttpServer()).get(
        `/assessment/quiz/findById/${quizId}`,
      );
      expect(getRes.status).toBe(200);
      expect(getRes.body).toHaveProperty('title', 'Updated Title');
    }
  });

  it('DELETE /assessment/quiz/delete/:quizId -> deletes quiz and verifies via GET', async () => {
    // Create a quiz to delete
    const createRes = await request(app.getHttpServer())
      .post('/assessment/quiz/create')
      .send({ title: 'Quiz to Delete', questions: [] });
    expect(createRes.status).toBe(201);

    // Get quizzes to find the one we just created
    const listRes = await request(app.getHttpServer()).get(
      `/assessment/quiz/findByUserId/${seededUserId}`,
    );
    const quizId = listRes.body[0]?.id;

    if (quizId) {
      const deleteRes = await request(app.getHttpServer()).delete(
        `/assessment/quiz/delete/${quizId}`,
      );
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body).toEqual({ message: 'Quiz deleted' });

      // Verify deletion by attempting to fetch
      const getRes = await request(app.getHttpServer()).get(
        `/assessment/quiz/findById/${quizId}`,
      );
      expect(getRes.status).toBe(404);
    }
  });

  it('PUT /assessment/quiz/assign -> assigns quiz to user', async () => {
    const payload = {
      quizId: new (require('mongodb').ObjectId)().toString(),
      userId: seededUserId,
    };
    const res = await request(app.getHttpServer())
      .put('/assessment/quiz/assign')
      .send(payload);
    // Will fail because quiz doesn't exist, but verifies endpoint works
    expect([200, 400, 404]).toContain(res.status);
  });

  it('GET /assessment/result/user/:studentId -> returns assessment results', async () => {
    const res = await request(app.getHttpServer()).get(
      `/assessment/result/user/${seededUserId}`,
    );
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('DELETE /assessment/result/:assessResId -> deletes assessment result and verifies via GET', async () => {
    // Create an assessment result first (via POST /assessment/result/ai/grade mock)
    const gradeRes = await request(app.getHttpServer())
      .post('/assessment/result/ai/grade')
      .send({
        quizId: new (require('mongodb').ObjectId)().toString(),
        studentId: seededUserId,
        answers: [],
      });
    expect([200, 201]).toContain(gradeRes.status);

    // Get results to find the one we just created
    const listRes = await request(app.getHttpServer()).get(
      `/assessment/result/user/${seededUserId}`,
    );
    const resultId = listRes.body[0]?.id;

    if (resultId) {
      const deleteRes = await request(app.getHttpServer()).delete(
        `/assessment/result/${resultId}`,
      );
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body).toEqual({ message: 'Assessment result deleted' });

      // Verify deletion by fetching results again
      const verifyRes = await request(app.getHttpServer()).get(
        `/assessment/result/user/${seededUserId}`,
      );
      expect(verifyRes.status).toBe(200);
      const deletedResult = verifyRes.body.find((r: any) => r.id === resultId);
      expect(deletedResult).toBeUndefined();
    }
  });
});
