import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class GameController {
  /**
   * POST /api/games
   * Adiciona um jogo à coleção do usuário autenticado.
   * O userId é extraído do token JWT pelo authMiddleware.
   */
  async create(req: Request, res: Response): Promise<void> {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Não autorizado.' });
      return;
    }

    const { title, platform, condition, region, notes } = req.body;

    // Campos obrigatórios
    if (!title || !platform || !condition) {
      res.status(400).json({
        success: false,
        message: 'Os campos title, platform e condition são obrigatórios.',
      });
      return;
    }

    const game = await prisma.game.create({
      data: {
        userId,
        title,
        platform,
        condition,
        region: region ?? 'RegionFree',
        notes: notes ?? null,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: game.id,
        title: game.title,
        platform: game.platform,
        condition: game.condition,
        region: game.region,
        notes: game.notes,
        createdAt: game.createdAt,
      },
    });
  }

  /**
   * GET /api/games
   * Lista todos os jogos do usuário autenticado.
   */
  async index(req: Request, res: Response): Promise<void> {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Não autorizado.' });
      return;
    }

    const games = await prisma.game.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, data: games });
  }

  async show(_req: Request, res: Response): Promise<void> {
    res.status(501).json({ message: 'Não implementado ainda' });
  }

  /**
   * PUT /api/games/:id
   * Edita um jogo da coleção. Apenas o dono pode editar.
   */
  async update(req: Request, res: Response): Promise<void> {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Não autorizado.' });
      return;
    }

    // Verificar se o jogo existe e pertence ao usuário
    const game = await prisma.game.findFirst({ where: { id, userId } });
    if (!game) {
      res.status(404).json({ success: false, message: 'Jogo não encontrado.' });
      return;
    }

    const { title, platform, condition, region, notes } = req.body;

    if (!title && !platform && !condition && !region && notes === undefined) {
      res.status(400).json({
        success: false,
        message: 'Informe ao menos um campo para atualizar.',
      });
      return;
    }

    const dataToUpdate: Record<string, unknown> = {};
    if (title)     dataToUpdate.title     = title;
    if (platform)  dataToUpdate.platform  = platform;
    if (condition) dataToUpdate.condition = condition;
    if (region)    dataToUpdate.region    = region;
    if (notes !== undefined) dataToUpdate.notes = notes;

    const updated = await prisma.game.update({ where: { id }, data: dataToUpdate });

    res.status(200).json({
      success: true,
      message: 'Jogo atualizado com sucesso.',
      data: {
        id: updated.id,
        title: updated.title,
        platform: updated.platform,
        condition: updated.condition,
        region: updated.region,
        notes: updated.notes,
        createdAt: updated.createdAt,
      },
    });
  }

  /**
   * DELETE /api/games/:id
   * Remove um jogo da coleção. Apenas o dono pode remover.
   */
  async destroy(req: Request, res: Response): Promise<void> {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Não autorizado.' });
      return;
    }

    // Verificar se o jogo existe e pertence ao usuário
    const game = await prisma.game.findFirst({ where: { id, userId } });
    if (!game) {
      res.status(404).json({ success: false, message: 'Jogo não encontrado.' });
      return;
    }

    await prisma.game.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Jogo removido com sucesso.' });
  }
}
