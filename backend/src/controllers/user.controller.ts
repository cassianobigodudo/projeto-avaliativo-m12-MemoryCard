import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class UserController {
  /**
   * PUT /api/users/:id
   * Edita nome e/ou email do usuário autenticado.
   * Apenas o próprio usuário pode editar sua conta.
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const tokenUserId = req.userId;

    // Regra de segurança: apenas o dono da conta pode editar
    if (id !== tokenUserId) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado. Você só pode modificar a sua própria conta.',
      });
      return;
    }

    const { name, email } = req.body;

    // Pelo menos um campo deve ser enviado
    if (!name && !email) {
      res.status(400).json({
        success: false,
        message: 'Informe ao menos um campo para atualizar (name ou email).',
      });
      return;
    }

    // Se email for enviado, verificar se já está em uso por outro usuário
    if (email) {
      const emailInUse = await prisma.user.findFirst({
        where: { email, NOT: { id } },
      });
      if (emailInUse) {
        res.status(409).json({
          success: false,
          message: 'Este email já está em uso por outra conta.',
        });
        return;
      }
    }

    // Montar objeto de atualização apenas com campos enviados
    const dataToUpdate: { name?: string; email?: string } = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    res.status(200).json({
      success: true,
      message: 'Conta atualizada com sucesso.',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  }

  /**
   * DELETE /api/users/:id
   * Remove a conta do usuário autenticado.
   * Apenas o próprio usuário pode deletar sua conta.
   * Cascade delete remove todos os jogos vinculados (definido no schema).
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const tokenUserId = req.userId;

    // Regra de segurança: apenas o dono da conta pode deletar
    if (id !== tokenUserId) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado. Você só pode modificar a sua própria conta.',
      });
      return;
    }

    // Verificar se o usuário existe antes de deletar
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado.',
      });
      return;
    }

    await prisma.user.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Conta deletada com sucesso.',
    });
  }
}
