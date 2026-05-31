import { Request, Response } from 'express';
import { AuthController } from '../controllers/auth.controller';

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Mock do Prisma: isola o banco de dados nos testes
jest.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock do bcrypt: evita custo computacional real do hash nos testes
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password_mock'),
}));

import { prisma } from '../lib/prisma';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Cria um objeto Request falso com o body fornecido.
 */
function mockRequest(body: Record<string, unknown>): Partial<Request> {
  return { body };
}

/**
 * Cria um objeto Response falso que captura status e json chamados.
 * Retorna o próprio res para encadeamento (res.status().json()).
 */
function mockResponse(): Partial<Response> & {
  statusCode: number;
  jsonBody: unknown;
} {
  const res = {
    statusCode: 0,
    jsonBody: null as unknown,
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockImplementation(function (this: typeof res, body: unknown) {
      this.jsonBody = body;
      return this;
    }),
  };
  // Captura o código passado para status()
  (res.status as jest.Mock).mockImplementation((code: number) => {
    res.statusCode = code;
    return res;
  });
  return res;
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('AuthController - register', () => {
  let controller: AuthController;

  beforeEach(() => {
    controller = new AuthController();
  });

  // ── Teste 1 ──────────────────────────────────────────────────────────────────
  it('Teste 1: Cadastrar com sucesso — deve retornar 201 e os dados do usuário sem a senha', async () => {
    // Arrange
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null); // email não existe
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: 'uuid-123',
      name: 'Fulano',
      email: 'fulano@email.com',
      passwordHash: 'hashed_password_mock',
      createdAt: new Date(),
    });

    const req = mockRequest({ name: 'Fulano', email: 'fulano@email.com', password: 'Senha123' });
    const res = mockResponse();

    // Act
    await controller.register(req as Request, res as Response);

    // Assert — sucesso
    expect(res.statusCode).toBe(201);
    expect((res.json as jest.Mock).mock.calls[0][0]).toEqual({
      success: true,
      data: { id: 'uuid-123', name: 'Fulano', email: 'fulano@email.com' },
    });

    // Assert — senha NÃO deve aparecer na resposta
    const responseBody = (res.json as jest.Mock).mock.calls[0][0];
    expect(responseBody.data).not.toHaveProperty('passwordHash');
    expect(responseBody.data).not.toHaveProperty('password');
  });

  // ── Teste 2 ──────────────────────────────────────────────────────────────────
  it('Teste 2: Campo name ausente — deve retornar 400 com mensagem de campos obrigatórios', async () => {
    // Arrange
    const req = mockRequest({ email: 'fulano@email.com', password: 'Senha123' });
    const res = mockResponse();

    // Act
    await controller.register(req as Request, res as Response);

    // Assert — fracasso por campo faltando
    expect(res.statusCode).toBe(400);
    expect((res.json as jest.Mock).mock.calls[0][0]).toMatchObject({
      success: false,
      message: 'Os campos name, email e password são obrigatórios.',
    });
  });

  // ── Teste 3 ──────────────────────────────────────────────────────────────────
  it('Teste 3: Campo email ausente — deve retornar 400 com mensagem de campos obrigatórios', async () => {
    // Arrange
    const req = mockRequest({ name: 'Fulano', password: 'Senha123' });
    const res = mockResponse();

    // Act
    await controller.register(req as Request, res as Response);

    // Assert — fracasso por campo faltando
    expect(res.statusCode).toBe(400);
    expect((res.json as jest.Mock).mock.calls[0][0]).toMatchObject({
      success: false,
      message: 'Os campos name, email e password são obrigatórios.',
    });
  });

  // ── Teste 4 ──────────────────────────────────────────────────────────────────
  it('Teste 4: Campo password ausente — deve retornar 400 com mensagem de campos obrigatórios', async () => {
    // Arrange
    const req = mockRequest({ name: 'Fulano', email: 'fulano@email.com' });
    const res = mockResponse();

    // Act
    await controller.register(req as Request, res as Response);

    // Assert — fracasso por campo faltando
    expect(res.statusCode).toBe(400);
    expect((res.json as jest.Mock).mock.calls[0][0]).toMatchObject({
      success: false,
      message: 'Os campos name, email e password são obrigatórios.',
    });
  });

  // ── Teste 5 ──────────────────────────────────────────────────────────────────
  it('Teste 5: Email com formato inválido — deve retornar 400 com mensagem de email inválido', async () => {
    // Arrange
    const req = mockRequest({ name: 'Fulano', email: 'email-invalido', password: 'Senha123' });
    const res = mockResponse();

    // Act
    await controller.register(req as Request, res as Response);

    // Assert — fracasso por email mal formatado
    expect(res.statusCode).toBe(400);
    expect((res.json as jest.Mock).mock.calls[0][0]).toMatchObject({
      success: false,
      message: 'O email informado não é válido.',
    });
  });

  // ── Teste 6 ──────────────────────────────────────────────────────────────────
  it('Teste 6: Senha fraca (sem número) — deve retornar 400 com mensagem de senha inválida', async () => {
    // Arrange
    const req = mockRequest({ name: 'Fulano', email: 'fulano@email.com', password: 'senhasemnum' });
    const res = mockResponse();

    // Act
    await controller.register(req as Request, res as Response);

    // Assert — fracasso por senha que não atende os critérios
    expect(res.statusCode).toBe(400);
    expect((res.json as jest.Mock).mock.calls[0][0]).toMatchObject({
      success: false,
      message: 'A senha deve ter no mínimo 8 caracteres, contendo pelo menos uma letra e um número.',
    });
  });

  // ── Teste 7 ──────────────────────────────────────────────────────────────────
  it('Teste 7: Email já cadastrado — deve retornar 409 com mensagem de conflito', async () => {
    // Arrange — simula que o email já existe no banco
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'uuid-existente',
      name: 'Outro Usuário',
      email: 'fulano@email.com',
    });

    const req = mockRequest({ name: 'Fulano', email: 'fulano@email.com', password: 'Senha123' });
    const res = mockResponse();

    // Act
    await controller.register(req as Request, res as Response);

    // Assert — fracasso por email duplicado
    expect(res.statusCode).toBe(409);
    expect((res.json as jest.Mock).mock.calls[0][0]).toMatchObject({
      success: false,
      message: 'Este email já está cadastrado.',
    });
  });
});
