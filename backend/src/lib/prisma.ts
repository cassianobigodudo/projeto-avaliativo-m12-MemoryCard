import { PrismaClient } from '@prisma/client';

// Singleton do Prisma Client para evitar múltiplas conexões
export const prisma = new PrismaClient();
