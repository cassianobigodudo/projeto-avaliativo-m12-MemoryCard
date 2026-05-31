import { Request, Response } from 'express';
import { ProfileController } from '../controllers/profile.controller';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('new_hashed_password'),
}));

import { prisma } from '../lib/prisma';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockRequest(body: Record<string, unknown> = {}, userId?: string): Partial<Request> {
  return { body, userId } as Partial<Request>;
}

function mockResponse(): Partial<Response> & { statusCode: number; jsonBody: unknown } {
  const res = { statusCode: 0, jsonBody: null as unknown, status: jest.fn(), json: jest.fn() };
  (res.status as jest.Mock).mockImplementation((code: number) => { res.statusCode = code; return res; });
  (res.json as jest.Mock).mockImplementation((body: unknown) => { res.jsonBody = body; return res; });
  return res;
}

const fakeUser = {
  id: 'user-uuid-123',
  name: 'Cassiano',
  email: 'cassiano@email.com',
  passwordHash: 'old_hash',
  createdAt: new Date(),
};

// ─── Testes: UPDATE PROFILE ───────────────────────────────────────────────────

describe('ProfileController - update', () => {
  let controller: ProfileController;

  beforeEach(() => { controller = new ProfileController(); });

  it('Teste A: Atualização bem-sucedida do nome — deve retornar 200 com dados atualizados', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null); // email não em uso
    (prisma.user.update as jest.Mock).mockResolvedValue({ ...fakeUser, name: 'Cassiano Atualizado' });

    const req = mockRequest({ name: 'Cassiano Atualizado' }, 'user-uuid-123');
    const res = mockResponse();

    await controller.update(req as Request, res as Response);

    expect(res.statusCode).toBe(200);
    expect(res.jsonBody).toMatchObject({
      success: true,
      message: 'Perfil atualizado com sucesso.',
      data: { name: 'Cassiano Atualizado' },
    });
    // Senha NÃO deve aparecer na resposta
    const data = (res.jsonBody as { data: Record<string, unknown> }).data;
    expect(data).not.toHaveProperty('passwordHash');
  });

  it('Teste B: Atualização com nova senha — deve hashear antes de salvar', async () => {
    (prisma.user.update as jest.Mock).mockResolvedValue(fakeUser);

    const req = mockRequest({ password: 'NovaSenha123' }, 'user-uuid-123');
    const res = mockResponse();

    await controller.update(req as Request, res as Response);

    expect(res.statusCode).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ passwordHash: 'new_hashed_password' }),
      })
    );
  });

  it('Teste C: Email já em uso por outro usuário — deve retornar 409', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 'outro-user', email: 'usado@email.com' });

    const req = mockRequest({ email: 'usado@email.com' }, 'user-uuid-123');
    const res = mockResponse();

    await controller.update(req as Request, res as Response);

    expect(res.statusCode).toBe(409);
    expect(res.jsonBody).toMatchObject({
      success: false,
      message: 'Este email já está em uso por outra conta.',
    });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('Teste D: Nenhum campo enviado — deve retornar 400', async () => {
    const req = mockRequest({}, 'user-uuid-123');
    const res = mockResponse();

    await controller.update(req as Request, res as Response);

    expect(res.statusCode).toBe(400);
  });

  it('Teste E: Senha fraca — deve retornar 400', async () => {
    const req = mockRequest({ password: 'fraca' }, 'user-uuid-123');
    const res = mockResponse();

    await controller.update(req as Request, res as Response);

    expect(res.statusCode).toBe(400);
    expect(res.jsonBody).toMatchObject({
      success: false,
      message: 'A senha deve ter no mínimo 8 caracteres, contendo pelo menos uma letra e um número.',
    });
  });

  it('Teste F: Sem userId no token — deve retornar 401', async () => {
    const req = mockRequest({ name: 'X' }, undefined);
    const res = mockResponse();

    await controller.update(req as Request, res as Response);

    expect(res.statusCode).toBe(401);
  });
});

// ─── Testes: DELETE PROFILE ───────────────────────────────────────────────────

describe('ProfileController - delete', () => {
  let controller: ProfileController;

  beforeEach(() => { controller = new ProfileController(); });

  it('Teste G: Exclusão bem-sucedida — deve retornar 200 e remover o usuário (cascade nos jogos)', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(fakeUser);
    (prisma.user.delete as jest.Mock).mockResolvedValue(fakeUser);

    const req = mockRequest({}, 'user-uuid-123');
    const res = mockResponse();

    await controller.delete(req as Request, res as Response);

    expect(res.statusCode).toBe(200);
    expect(res.jsonBody).toMatchObject({ success: true, message: 'Conta deletada com sucesso.' });
    // Prisma delete foi chamado — cascade remove jogos automaticamente pelo schema
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user-uuid-123' } });
  });

  it('Teste H: Usuário não encontrado — deve retornar 404', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const req = mockRequest({}, 'user-uuid-123');
    const res = mockResponse();

    await controller.delete(req as Request, res as Response);

    expect(res.statusCode).toBe(404);
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it('Teste I: Sem userId no token — deve retornar 401', async () => {
    const req = mockRequest({}, undefined);
    const res = mockResponse();

    await controller.delete(req as Request, res as Response);

    expect(res.statusCode).toBe(401);
  });
});
