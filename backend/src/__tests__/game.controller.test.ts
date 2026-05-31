import { Request, Response } from 'express';
import { GameController } from '../controllers/game.controller';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../lib/prisma', () => ({
  prisma: {
    game: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { prisma } from '../lib/prisma';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockRequest(
  body: Record<string, unknown> = {},
  userId?: string
): Partial<Request> {
  return { body, userId } as Partial<Request>;
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

const fakeGame = {
  id: 'game-uuid-123',
  userId: 'user-uuid-123',
  title: 'Super Mario World',
  platform: 'Super Nintendo',
  condition: 'Sealed',
  region: 'RegionFree',
  notes: null,
  createdAt: new Date(),
};

// ─── Testes: CREATE ───────────────────────────────────────────────────────────

describe('GameController - create', () => {
  let controller: GameController;

  beforeEach(() => {
    controller = new GameController();
  });

  it('Teste 1: Adicionar jogo com sucesso — deve retornar 201 com dados do jogo', async () => {
    // Arrange
    (prisma.game.create as jest.Mock).mockResolvedValue(fakeGame);

    const req = mockRequest(
      { title: 'Super Mario World', platform: 'Super Nintendo', condition: 'Sealed' },
      'user-uuid-123'
    );
    const res = mockResponse();

    // Act
    await controller.create(req as Request, res as Response);

    // Assert
    expect(res.statusCode).toBe(201);
    expect(res.jsonBody).toMatchObject({
      success: true,
      data: {
        id: 'game-uuid-123',
        title: 'Super Mario World',
        platform: 'Super Nintendo',
        condition: 'Sealed',
      },
    });
  });

  it('Teste 2: Regra de negócio — userId do jogo deve ser o userId do token (não do body)', async () => {
    // Arrange
    (prisma.game.create as jest.Mock).mockResolvedValue(fakeGame);

    const req = mockRequest(
      { title: 'Zelda', platform: 'SNES', condition: 'Loose' },
      'user-uuid-123'
    );
    const res = mockResponse();

    // Act
    await controller.create(req as Request, res as Response);

    // Assert — o Prisma deve ter sido chamado com o userId do TOKEN
    expect(prisma.game.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'user-uuid-123' }),
      })
    );
  });

  it('Teste 3: Sem userId no token — deve retornar 401', async () => {
    // Arrange — userId ausente (middleware não injetou)
    const req = mockRequest({ title: 'Zelda', platform: 'SNES', condition: 'Loose' }, undefined);
    const res = mockResponse();

    // Act
    await controller.create(req as Request, res as Response);

    // Assert
    expect(res.statusCode).toBe(401);
    expect(res.jsonBody).toMatchObject({ success: false, message: 'Não autorizado.' });
  });

  it('Teste 4: Campos obrigatórios ausentes — deve retornar 400', async () => {
    // Arrange — sem condition
    const req = mockRequest({ title: 'Zelda', platform: 'SNES' }, 'user-uuid-123');
    const res = mockResponse();

    // Act
    await controller.create(req as Request, res as Response);

    // Assert
    expect(res.statusCode).toBe(400);
    expect(res.jsonBody).toMatchObject({
      success: false,
      message: 'Os campos title, platform e condition são obrigatórios.',
    });
  });

  it('Teste 5: Sem title — deve retornar 400', async () => {
    const req = mockRequest({ platform: 'SNES', condition: 'Loose' }, 'user-uuid-123');
    const res = mockResponse();

    await controller.create(req as Request, res as Response);

    expect(res.statusCode).toBe(400);
  });
});

// ─── Testes: INDEX ────────────────────────────────────────────────────────────

describe('GameController - index', () => {
  let controller: GameController;

  beforeEach(() => {
    controller = new GameController();
  });

  it('Teste 6: Listar jogos — deve retornar apenas jogos do usuário autenticado', async () => {
    // Arrange
    (prisma.game.findMany as jest.Mock).mockResolvedValue([fakeGame]);

    const req = mockRequest({}, 'user-uuid-123');
    const res = mockResponse();

    // Act
    await controller.index(req as Request, res as Response);

    // Assert — findMany deve filtrar pelo userId do token
    expect(prisma.game.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-uuid-123' },
      })
    );
    expect(res.statusCode).toBe(200);
    expect(res.jsonBody).toMatchObject({ success: true, data: [fakeGame] });
  });

  it('Teste 7: Sem userId no token ao listar — deve retornar 401', async () => {
    const req = mockRequest({}, undefined);
    const res = mockResponse();

    await controller.index(req as Request, res as Response);

    expect(res.statusCode).toBe(401);
  });
});

// ─── Testes: UPDATE ───────────────────────────────────────────────────────────

describe('GameController - update', () => {
  let controller: GameController;

  beforeEach(() => {
    controller = new GameController();
  });

  it('Teste 8: Editar jogo com sucesso — dono pode editar e recebe 200', async () => {
    (prisma.game.findFirst as jest.Mock).mockResolvedValue(fakeGame);
    (prisma.game.update as jest.Mock).mockResolvedValue({ ...fakeGame, title: 'Mario Atualizado' });

    const req = { body: { title: 'Mario Atualizado' }, userId: 'user-uuid-123', params: { id: 'game-uuid-123' } } as unknown as Request;
    const res = mockResponse();

    await controller.update(req, res as Response);

    expect(res.statusCode).toBe(200);
    expect(res.jsonBody).toMatchObject({ success: true, message: 'Jogo atualizado com sucesso.' });
  });

  it('Teste 9: Tentar editar jogo de outro usuário — deve retornar 404 (jogo não encontrado para esse userId)', async () => {
    // findFirst retorna null porque o userId não bate
    (prisma.game.findFirst as jest.Mock).mockResolvedValue(null);

    const req = { body: { title: 'Hack' }, userId: 'outro-user', params: { id: 'game-uuid-123' } } as unknown as Request;
    const res = mockResponse();

    await controller.update(req, res as Response);

    expect(res.statusCode).toBe(404);
    expect(res.jsonBody).toMatchObject({ success: false, message: 'Jogo não encontrado.' });
    expect(prisma.game.update).not.toHaveBeenCalled();
  });

  it('Teste 10: Sem userId no token ao editar — deve retornar 401', async () => {
    const req = { body: { title: 'X' }, userId: undefined, params: { id: 'game-uuid-123' } } as unknown as Request;
    const res = mockResponse();

    await controller.update(req, res as Response);

    expect(res.statusCode).toBe(401);
  });

  it('Teste 11: Nenhum campo enviado para editar — deve retornar 400', async () => {
    (prisma.game.findFirst as jest.Mock).mockResolvedValue(fakeGame);

    const req = { body: {}, userId: 'user-uuid-123', params: { id: 'game-uuid-123' } } as unknown as Request;
    const res = mockResponse();

    await controller.update(req, res as Response);

    expect(res.statusCode).toBe(400);
    expect(res.jsonBody).toMatchObject({ success: false, message: 'Informe ao menos um campo para atualizar.' });
  });
});

// ─── Testes: DESTROY ──────────────────────────────────────────────────────────

describe('GameController - destroy', () => {
  let controller: GameController;

  beforeEach(() => {
    controller = new GameController();
  });

  it('Teste 12: Deletar jogo com sucesso — dono pode deletar e recebe 200', async () => {
    (prisma.game.findFirst as jest.Mock).mockResolvedValue(fakeGame);
    (prisma.game.delete as jest.Mock).mockResolvedValue(fakeGame);

    const req = { body: {}, userId: 'user-uuid-123', params: { id: 'game-uuid-123' } } as unknown as Request;
    const res = mockResponse();

    await controller.destroy(req, res as Response);

    expect(res.statusCode).toBe(200);
    expect(res.jsonBody).toMatchObject({ success: true, message: 'Jogo removido com sucesso.' });
  });

  it('Teste 13: Tentar deletar jogo de outro usuário — deve retornar 404', async () => {
    (prisma.game.findFirst as jest.Mock).mockResolvedValue(null);

    const req = { body: {}, userId: 'outro-user', params: { id: 'game-uuid-123' } } as unknown as Request;
    const res = mockResponse();

    await controller.destroy(req, res as Response);

    expect(res.statusCode).toBe(404);
    expect(prisma.game.delete).not.toHaveBeenCalled();
  });

  it('Teste 14: Sem userId no token ao deletar — deve retornar 401', async () => {
    const req = { body: {}, userId: undefined, params: { id: 'game-uuid-123' } } as unknown as Request;
    const res = mockResponse();

    await controller.destroy(req, res as Response);

    expect(res.statusCode).toBe(401);
  });
});
