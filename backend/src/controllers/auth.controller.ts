import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const { name, email, password } = req.body;

    // Validação dos campos obrigatórios
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Os campos name, email e password são obrigatórios.',
      });
      return;
    }

    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'O email informado não é válido.',
      });
      return;
    }

    // Validação da senha: mínimo 8 caracteres, ao menos uma letra e um número
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({
        success: false,
        message:
          'A senha deve ter no mínimo 8 caracteres, contendo pelo menos uma letra e um número.',
      });
      return;
    }

    // Verificar se o email já está em uso
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'Este email já está cadastrado.',
      });
      return;
    }

    // Hash da senha com bcrypt (salt rounds = 10)
    const passwordHash = await bcrypt.hash(password, 10);

    // Criar o usuário no banco
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    // Retornar sem expor o hash da senha
    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  }

  async login(_req: Request, res: Response): Promise<void> {
    res.status(501).json({ message: 'Não implementado ainda' });
  }
}
