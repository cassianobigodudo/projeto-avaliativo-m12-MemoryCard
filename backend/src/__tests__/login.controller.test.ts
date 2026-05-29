import { Request, Response } from 'express';
import { AuthController } from '../controllers/auth.controller';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password_mock'),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock_jwt_token'),
}));

import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockRequest(body: Record<string, unknown>): Partial<Request> {
  return { body };
}

function mockResponse(): Partial<Response> & { statusCode: number; jsonBody: unknown } {
  const res = {
    statusCode: 0,
    jsonBody: null as unknown,
    status: jest.fn(),
    json: jest.fn(),
  };
  (res.status as jest.Mock).mockImplementation((code: number) => {
    res.statusCode = code;
    return res;
  });
  (res.json as jest.Mock).mockImplementation((body: unknown) => {
    res.jsonBody = body;
    return res;
  });
  return res;
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('AuthController - login', () => {
  let controller: AuthController;

  beforeEach(() => {
    controller = new AuthController();
    process.env.JWT_SECRET = 'test_secret';
  });

  // ── Teste A ──────────────────────────────────────────────────────────────────
  it('Teste A: Login com sucesso — deve retornar 200, token JWT e dados do usuário sem senha', async () => {
    // Arrange
    const fakeUser = {
      id: 'uuid-123',
      name: 'Cassiano',
      email: 'cassiano@email.com',
      passwordHash: 'hashed_password_mock',
      createdAt: new Date(),
    };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(fakeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const req = mockRequest({ email: 'cassiano@email.com', password: 'Senha123' });
    const res = mockResponse();

    // Act
    await controller.login(req as Request, res as Response);

    // Assert — status 200
    expect(res.statusCode).toBe(200);

    // Assert — formato exato da resposta
    expect(res.jsonBody).toEqual({
      success: true,
      token: 'mock_jwt_token',
      user: {
        id: 'uuid-123',
        name: 'Cassiano',
        email: 'cassiano@email.com',
      },
    });

    // Assert — senha NÃO deve aparecer na resposta
    const body = res.jsonBody as Record<string, unknown>;
    const user = body.user as Record<string, unknown>;
    expect(user).not.toHaveProperty('passwordHash');
    expect(user).not.toHaveProperty('password');
  });

  // ── Teste B ──────────────────────────────────────────────────────────────────
  it('Teste B: Email inexistente — deve retornar 401 com mensagem genérica', async () => {
    // Arrange — simula que o usuário não existe no banco
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const req = mockRequest({ email: 'naoexiste@email.com', password: 'Senha123' });
    const res = mockResponse();

    // Act
    await controller.login(req as Request, res as Response);

    // Assert — 401 com mensagem genérica (não revela se email existe)
    expect(res.statusCode).toBe(401);
    expect(res.jsonBody).toMatchObject({
      success: false,
      message: 'Email ou senha inválidos.',
    });
  });

  // ── Teste C ──────────────────────────────────────────────────────────────────
  it('Teste C: Senha incorreta — deve retornar 401 com mensagem genérica', async () => {
    // Arrange — usuário existe mas senha não bate
    const fakeUser = {
      id: 'uuid-123',
      name: 'Cassiano',
      email: 'cassiano@email.com',
      passwordHash: 'hashed_password_mock',
      createdAt: new Date(),
    };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(fakeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false); // senha errada

    const req = mockRequest({ email: 'cassiano@email.com', password: 'SenhaErrada1' });
    const res = mockResponse();

    // Act
    await controller.login(req as Request, res as Response);

    // Assert — 401 com mensagem genérica (não revela qual campo está errado)
    expect(res.statusCode).toBe(401);
    expect(res.jsonBody).toMatchObject({
      success: false,
      message: 'Email ou senha inválidos.',
    });
  });

  // ── Teste D ──────────────────────────────────────────────────────────────────
  it('Teste D: Campos ausentes — deve retornar 400 com mensagem de campos obrigatórios', async () => {
    // Arrange
    const req = mockRequest({ email: 'cassiano@email.com' }); // sem password
    const res = mockResponse();

    // Act
    await controller.login(req as Request, res as Response);

    // Assert
    expect(res.statusCode).toBe(400);
    expect(res.jsonBody).toMatchObject({
      success: false,
      message: 'Os campos email e password são obrigatórios.',
    });
  });
});
