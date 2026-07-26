import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig = {
  experimental: {
    useTypeScriptCli: true,
  },
  turbopack: {
    root: path.resolve(import.meta.dirname, '..'),
  },
} satisfies NextConfig;

export default nextConfig;
