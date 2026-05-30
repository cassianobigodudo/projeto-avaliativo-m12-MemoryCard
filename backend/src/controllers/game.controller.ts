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

  async update(_req: Request, res: Response): Promise<void> {
    res.status(501).json({ message: 'Não implementado ainda' });
  }

  async destroy(_req: Request, res: Response): Promise<void> {
    res.status(501).json({ message: 'Não implementado ainda' });
  }
}
