import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';

// ─── Mock do jsonwebtoken ─────────────────────────────────────────────────────

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

import jwt from 'jsonwebtoken';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockRequest(headers: Record<string, string> = {}): Partial<Request> {
  return { headers } as Partial<Request>;
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

describe('authMiddleware', () => {
  let next: NextFunction;

  beforeEach(() => {
    next = jest.fn();
    process.env.JWT_SECRET = 'test_secret';
  });

  // ── Teste 1 ──────────────────────────────────────────────────────────────────
  it('Teste 1: Token válido — deve chamar next() e injetar userId no request', () => {
    // Arrange
    (jwt.verify as jest.Mock).mockReturnValue({ userId: 'uuid-123' });

    const req = mockRequest({ authorization: 'Bearer valid_token' });
    const res = mockResponse();

    // Act
    authMiddleware(req as Request, res as Response, next);

    // Assert — next foi chamado (rota liberada)
    expect(next).toHaveBeenCalled();
    expect((req as Request).userId).toBe('uuid-123');
  });

  // ── Teste 2 ──────────────────────────────────────────────────────────────────
  it('Teste 2: Header Authorization ausente — deve retornar 401', () => {
    // Arrange — sem header
    const req = mockRequest({});
    const res = mockResponse();

    // Act
    authMiddleware(req as Request, res as Response, next);

    // Assert — bloqueado com 401
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(res.jsonBody).toMatchObject({
      success: false,
      message: 'Token de autenticação não fornecido.',
    });
  });

  // ── Teste 3 ──────────────────────────────────────────────────────────────────
  it('Teste 3: Header sem prefixo Bearer — deve retornar 401', () => {
    // Arrange — token sem "Bearer "
    const req = mockRequest({ authorization: 'invalid_token_without_bearer' });
    const res = mockResponse();

    // Act
    authMiddleware(req as Request, res as Response, next);

    // Assert
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
  });

  // ── Teste 4 ──────────────────────────────────────────────────────────────────
  it('Teste 4: Token inválido ou expirado — deve retornar 401', () => {
    // Arrange — jwt.verify lança erro
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid token');
    });

    const req = mockRequest({ authorization: 'Bearer expired_or_invalid_token' });
    const res = mockResponse();

    // Act
    authMiddleware(req as Request, res as Response, next);

    // Assert
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(res.jsonBody).toMatchObject({
      success: false,
      message: 'Token inválido ou expirado.',
    });
  });
});
