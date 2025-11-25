import { Test } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';
import { AssessmentController } from './assessment.controller';
import { AssessmentService } from './assessment.service';
import { JwtAccessGuard } from 'src/auth/guards/jwt/jwt.access.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';

describe('AssessmentController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;

  const validId = '507f1f77bcf86cd799439011';

  const mockQuiz = { id: validId, title: 'Sample Quiz', questions: [] };
  const mockAssessResult = { id: validId, rating: 10, comment: 'Good' };

  const mockAssessmentService = {
    createQuiz: jest.fn().mockResolvedValue({ message: 'Quiz created' }),
    generateQuizAI: jest.fn().mockResolvedValue(mockQuiz),
    findQuizById: jest.fn().mockResolvedValue(mockQuiz),
    findQuizByUserId: jest.fn().mockResolvedValue([mockQuiz]),
    updateQuiz: jest.fn().mockResolvedValue({ message: 'Quiz updated' }),
    deleteQuiz: jest.fn().mockResolvedValue({ message: 'Quiz deleted' }),
    assignQuizToUser: jest
      .fn()
      .mockResolvedValue({ message: 'Quiz assigned to user' }),
    gradeQuizAI: jest
      .fn()
      .mockResolvedValue({ rating: 10, comment: 'Excellent' }),
    gradeQuizAIRealtime: jest.fn().mockImplementation(async function* () {
      yield 'chunk1';
      yield 'chunk2';
    }),
    getAssessResult: jest.fn().mockResolvedValue([mockAssessResult]),
    deleteAssessResult: jest
      .fn()
      .mockResolvedValue({ message: 'Assessment result deleted' }),
  };

  const mockJwtGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { userId: validId };
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

    const moduleRef = await Test.createTestingModule({
      controllers: [AssessmentController],
      providers: [
        { provide: AssessmentService, useValue: mockAssessmentService },
        { provide: 'MONGO_DB_CONN', useValue: db },
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

  it('POST /assessment/quiz/create -> creates quiz', async () => {
    const payload = { title: 'Q', questions: [] };
    const res = await request(app.getHttpServer())
      .post('/assessment/quiz/create')
      .send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: 'Quiz created' });
    expect(mockAssessmentService.createQuiz).toHaveBeenCalledWith(payload);
  });

  it('GET /assessment/quiz/ai/gen -> generate quiz AI', async () => {
    const res = await request(app.getHttpServer()).get(
      '/assessment/quiz/ai/gen?topic=math',
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockQuiz);
    expect(mockAssessmentService.generateQuizAI).toHaveBeenCalled();
  });

  it('GET /assessment/quiz/findById/:quizId -> returns quiz', async () => {
    const res = await request(app.getHttpServer()).get(
      `/assessment/quiz/findById/${validId}`,
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockQuiz);
    expect(mockAssessmentService.findQuizById).toHaveBeenCalledWith(validId);
  });

  it('GET /assessment/quiz/findByUserId/:userId -> returns quizzes', async () => {
    const res = await request(app.getHttpServer()).get(
      `/assessment/quiz/findByUserId/${validId}`,
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual([mockQuiz]);
    expect(mockAssessmentService.findQuizByUserId).toHaveBeenCalledWith(
      validId,
    );
  });

  it('PUT /assessment/quiz/update -> updates quiz', async () => {
    const payload = { id: validId, title: 'Updated' };
    const res = await request(app.getHttpServer())
      .put('/assessment/quiz/update')
      .send(payload);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Quiz updated' });
    expect(mockAssessmentService.updateQuiz).toHaveBeenCalledWith(payload);
  });

  it('DELETE /assessment/quiz/delete/:quizId -> deletes quiz', async () => {
    const res = await request(app.getHttpServer()).delete(
      `/assessment/quiz/delete/${validId}`,
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Quiz deleted' });
    expect(mockAssessmentService.deleteQuiz).toHaveBeenCalledWith(validId);
  });

  it('PUT /assessment/quiz/assign -> assigns quiz', async () => {
    const payload = { quizId: validId, userId: validId };
    const res = await request(app.getHttpServer())
      .put('/assessment/quiz/assign')
      .send(payload);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Quiz assigned to user' });
    expect(mockAssessmentService.assignQuizToUser).toHaveBeenCalledWith(
      payload,
    );
  });

  it('POST /assessment/result/ai/grade -> grade quiz AI and save', async () => {
    const payload = { studentId: validId, answers: [] };
    const res = await request(app.getHttpServer())
      .post('/assessment/result/ai/grade')
      .send(payload);
    expect([200, 201]).toContain(res.status);
    expect(res.body).toEqual({ rating: 10, comment: 'Excellent' });
    expect(mockAssessmentService.gradeQuizAI).toHaveBeenCalledWith(payload);
  });

  it('POST /assessment/result/ai/grade/realtime -> streams chunks', async () => {
    const payload = { question: 'Q', answer: 'A' };
    const res = await request(app.getHttpServer())
      .post('/assessment/result/ai/grade/realtime')
      .send(payload);
    // controller uses raw res stream; express default status is 200 when not set
    expect([200, 201]).toContain(res.status);
    expect(res.text).toContain('chunk1');
    expect(res.text).toContain('chunk2');
    expect(mockAssessmentService.gradeQuizAIRealtime).toHaveBeenCalledWith(
      payload,
    );
  });

  it('GET /assessment/result/user/:studentId -> returns assessment results', async () => {
    const res = await request(app.getHttpServer()).get(
      `/assessment/result/user/${validId}`,
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual([mockAssessResult]);
    expect(mockAssessmentService.getAssessResult).toHaveBeenCalledWith(validId);
  });

  it('DELETE /assessment/result/:assessResId -> deletes assessment result', async () => {
    const res = await request(app.getHttpServer()).delete(
      `/assessment/result/${validId}`,
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Assessment result deleted' });
    expect(mockAssessmentService.deleteAssessResult).toHaveBeenCalledWith(
      validId,
    );
  });
});
