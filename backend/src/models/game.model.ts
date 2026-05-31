import { prisma } from '../lib/prisma';
import { Game, Condition, Region } from '@prisma/client';

export type CreateGameData = {
  userId: string;
  title: string;
  platform: string;
  condition: Condition;
  region?: Region;
  notes?: string;
};

export type UpdateGameData = Partial<Omit<CreateGameData, 'userId'>>;

// TODO: Implementar métodos do modelo Game
export class GameModel {
  async findAllByUser(userId: string): Promise<Game[]> {
    return prisma.game.findMany({ where: { userId } });
  }

  async findByIdAndUser(id: string, userId: string): Promise<Game | null> {
    return prisma.game.findFirst({ where: { id, userId } });
  }

  async create(data: CreateGameData): Promise<Game> {
    return prisma.game.create({ data });
  }

  async update(id: string, _userId: string, data: UpdateGameData): Promise<Game> {
    return prisma.game.update({ where: { id }, data });
  }

  async delete(id: string, _userId: string): Promise<void> {
    await prisma.game.delete({ where: { id } });
  }
}
