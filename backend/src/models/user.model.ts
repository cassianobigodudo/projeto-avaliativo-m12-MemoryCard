import { prisma } from '../lib/prisma';
import { User } from '@prisma/client';

export type CreateUserData = {
  name: string;
  email: string;
  passwordHash: string;
};

// TODO: Implementar métodos do modelo User
export class UserModel {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: CreateUserData): Promise<User> {
    return prisma.user.create({ data });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async deleteById(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }
}
