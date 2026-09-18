import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      '@meadowmist/shared': path.resolve(__dirname, 'packages/shared/src'),
      '@meadowmist/database': path.resolve(__dirname, 'packages/database/src'),
      '@storefront': path.resolve(__dirname, 'apps/storefront/src'),
      '@seller': path.resolve(__dirname, 'apps/seller/src'),
    },
  },
});
