import { Request, Response, NextFunction } from 'express';

// Extensão do tipo Request para incluir o usuário autenticado
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// TODO: Implementar validação do token JWT
export function authMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  // Placeholder - será implementado na feature de autenticação
  next();
}
