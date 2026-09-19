import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@meadowmist/database', '@meadowmist/shared'],
};

export default nextConfig;
