import { Request, Response } from 'express';

// TODO: Implementar lógica de autenticação
export class AuthController {
  async register(_req: Request, res: Response): Promise<void> {
    res.status(501).json({ message: 'Não implementado ainda' });
  }

  async login(_req: Request, res: Response): Promise<void> {
    res.status(501).json({ message: 'Não implementado ainda' });
  }
}
