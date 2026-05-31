import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';

export class ProfileController {
  /**
   * PUT /api/users/profile
   * Atualiza nome, email e/ou senha do usuário autenticado.
   * O userId é extraído do token JWT pelo authMiddleware.
   */
  async update(req: Request, res: Response): Promise<void> {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Não autorizado.' });
      return;
    }

    const { name, email, password } = req.body;

    // Pelo menos um campo deve ser enviado
    if (!name && !email && !password) {
      res.status(400).json({
        success: false,
        message: 'Informe ao menos um campo para atualizar (name, email ou password).',
      });
      return;
    }

    // Se email for enviado, verificar se já está em uso por outro usuário
    if (email) {
      const emailInUse = await prisma.user.findFirst({
        where: { email, NOT: { id: userId } },
      });
      if (emailInUse) {
        res.status(409).json({
          success: false,
          message: 'Este email já está em uso por outra conta.',
        });
        return;
      }
    }

    // Montar objeto de atualização
    const dataToUpdate: { name?: string; email?: string; passwordHash?: string } = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (password) {
      // Validação da senha: mínimo 8 caracteres, ao menos uma letra e um número
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(password)) {
        res.status(400).json({
          success: false,
          message: 'A senha deve ter no mínimo 8 caracteres, contendo pelo menos uma letra e um número.',
        });
        return;
      }
      dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    res.status(200).json({
      success: true,
      message: 'Perfil atualizado com sucesso.',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  }

  /**
   * DELETE /api/users/profile
   * Remove a conta do usuário autenticado e todos os seus jogos (cascade).
   * O userId é extraído do token JWT pelo authMiddleware.
   */
  async delete(req: Request, res: Response): Promise<void> {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Não autorizado.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
      return;
    }

    // Cascade delete remove todos os jogos automaticamente (definido no schema)
    await prisma.user.delete({ where: { id: userId } });

    res.status(200).json({
      success: true,
      message: 'Conta deletada com sucesso.',
    });
  }
}
