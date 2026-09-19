const { execSync } = require('child_process');
const path = require('path');

const cwd = path.resolve(__dirname, '..');
const defaultDbPath = path.resolve(cwd, 'prisma/dev.db').replace(/\\/g, '/');

const env = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL || `file:${defaultDbPath}`,
};

console.log(`[db-push] Using DATABASE_URL: ${env.DATABASE_URL.startsWith('file:') ? 'file:***' : env.DATABASE_URL}`);

execSync('npx prisma db push --accept-data-loss', {
  stdio: 'inherit',
  cwd,
  env,
});
