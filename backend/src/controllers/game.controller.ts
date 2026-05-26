import { Request, Response } from 'express';

// TODO: Implementar lógica do catálogo de jogos
export class GameController {
  async index(_req: Request, res: Response): Promise<void> {
    res.status(501).json({ message: 'Não implementado ainda' });
  }

  async create(_req: Request, res: Response): Promise<void> {
    res.status(501).json({ message: 'Não implementado ainda' });
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
