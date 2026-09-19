const { execSync } = require('child_process');
const path = require('path');

const cwd = path.resolve(__dirname, '..');
const defaultDbPath = path.resolve(cwd, 'prisma/dev.db').replace(/\\/g, '/');

const env = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL || `file:${defaultDbPath}`,
};

try {
  console.log('[db-seed] Seeding database...');
  execSync('npx tsx prisma/seed.ts', {
    stdio: 'inherit',
    cwd,
    env,
  });
  console.log('[db-seed] Database seeding completed.');
} catch (err) {
  console.warn('[db-seed] Non-fatal seed warning:', err.message);
}
