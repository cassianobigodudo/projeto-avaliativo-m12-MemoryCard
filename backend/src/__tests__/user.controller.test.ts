import { Request, Response } from 'express';
import { UserController } from '../controllers/user.controller';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { prisma } from '../lib/prisma';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockRequest(
  params: Record<string, string> = {},
  body: Record<string, unknown> = {},
  userId?: string
): Partial<Request> {
  return { params, body, userId } as Partial<Request>;
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

const fakeUser = {
  id: 'uuid-123',
  name: 'Cassiano',
  email: 'cassiano@email.com',
  passwordHash: 'hash',
  createdAt: new Date(),
};

// ─── Testes: UPDATE ───────────────────────────────────────────────────────────

describe('UserController - update', () => {
  let controller: UserController;

  beforeEach(() => {
    controller = new UserController();
  });

  it('Teste 1: Edição com sucesso — deve retornar 200 com dados atualizados', async () => {
    // Arrange
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null); // email não em uso
    (prisma.user.update as jest.Mock).mockResolvedValue({
      ...fakeUser,
      name: 'Cassiano Atualizado',
    });

    const req = mockRequest(
      { id: 'uuid-123' },
      { name: 'Cassiano Atualizado' },
      'uuid-123' // tokenUserId === id da rota
    );
    const res = mockResponse();

    // Act
    await controller.update(req as Request, res as Response);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.jsonBody).toMatchObject({
      success: true,
      message: 'Conta atualizada com sucesso.',
      data: { id: 'uuid-123', name: 'Cassiano Atualizado', email: 'cassiano@email.com' },
    });
  });

  it('Teste 2: Tentativa de editar conta de outro usuário — deve retornar 403', async () => {
    // Arrange — tokenUserId diferente do id da rota
    const req = mockRequest(
      { id: 'uuid-outro' },
      { name: 'Hacker' },
      'uuid-123'
    );
    const res = mockResponse();

    // Act
    await controller.update(req as Request, res as Response);

    // Assert
    expect(res.statusCode).toBe(403);
    expect(res.jsonBody).toMatchObject({
      success: false,
      message: 'Acesso negado. Você só pode modificar a sua própria conta.',
    });
  });

  it('Teste 3: Nenhum campo enviado — deve retornar 400', async () => {
    // Arrange — body vazio
    const req = mockRequest({ id: 'uuid-123' }, {}, 'uuid-123');
    const res = mockResponse();

    // Act
    await controller.update(req as Request, res as Response);

    // Assert
    expect(res.statusCode).toBe(400);
    expect(res.jsonBody).toMatchObject({
      success: false,
      message: 'Informe ao menos um campo para atualizar (name ou email).',
    });
  });

  it('Teste 4: Email já em uso por outro usuário — deve retornar 409', async () => {
    // Arrange — email já existe em outra conta
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 'uuid-outro', email: 'usado@email.com' });

    const req = mockRequest(
      { id: 'uuid-123' },
      { email: 'usado@email.com' },
      'uuid-123'
    );
    const res = mockResponse();

    // Act
    await controller.update(req as Request, res as Response);

    // Assert
    expect(res.statusCode).toBe(409);
    expect(res.jsonBody).toMatchObject({
      success: false,
      message: 'Este email já está em uso por outra conta.',
    });
  });
});

// ─── Testes: DELETE ───────────────────────────────────────────────────────────

describe('UserController - delete', () => {
  let controller: UserController;

  beforeEach(() => {
    controller = new UserController();
  });

  it('Teste 5: Deleção com sucesso — deve retornar 200 com mensagem de confirmação', async () => {
    // Arrange
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(fakeUser);
    (prisma.user.delete as jest.Mock).mockResolvedValue(fakeUser);

    const req = mockRequest({ id: 'uuid-123' }, {}, 'uuid-123');
    const res = mockResponse();

    // Act
    await controller.delete(req as Request, res as Response);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.jsonBody).toEqual({
      success: true,
      message: 'Conta deletada com sucesso.',
    });
  });

  it('Teste 6: Tentativa de deletar conta de outro usuário — deve retornar 403', async () => {
    // Arrange — tokenUserId diferente do id da rota
    const req = mockRequest({ id: 'uuid-outro' }, {}, 'uuid-123');
    const res = mockResponse();

    // Act
    await controller.delete(req as Request, res as Response);

    // Assert
    expect(res.statusCode).toBe(403);
    expect(res.jsonBody).toMatchObject({
      success: false,
      message: 'Acesso negado. Você só pode modificar a sua própria conta.',
    });
  });

  it('Teste 7: Deletar usuário inexistente — deve retornar 404', async () => {
    // Arrange — usuário não encontrado no banco
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const req = mockRequest({ id: 'uuid-123' }, {}, 'uuid-123');
    const res = mockResponse();

    // Act
    await controller.delete(req as Request, res as Response);

    // Assert
    expect(res.statusCode).toBe(404);
    expect(res.jsonBody).toMatchObject({
      success: false,
      message: 'Usuário não encontrado.',
    });
  });
});
