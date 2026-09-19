import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function findDatabasePath(): string {
  let current = process.cwd();
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(current, 'packages', 'database', 'prisma', 'dev.db');
    if (fs.existsSync(candidate)) {
      return candidate.replace(/\\/g, '/');
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return path.resolve(process.cwd(), 'packages/database/prisma/dev.db').replace(/\\/g, '/');
}

function getPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.startsWith('file:')) {
    const absoluteDbPath = findDatabasePath();
    return new PrismaClient({
      datasourceUrl: `file:${absoluteDbPath}`,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
  return new PrismaClient({
    datasourceUrl: dbUrl,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export * from '@prisma/client';
export default prisma;
