import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extensão do tipo Request para incluir o usuário autenticado
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

type JwtPayload = {
  userId: string;
};

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];

  // Verificar presença do header Authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Token de autenticação não fornecido.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado.',
    });
  }
}
