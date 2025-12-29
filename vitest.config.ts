import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/**',
        '**/index.ts',
        'src/app.ts',
        'src/server.ts',
        'src/routes/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@/config': path.resolve(__dirname, './src/config'),
      '@/models': path.resolve(__dirname, './src/models'),
      '@/controllers': path.resolve(__dirname, './src/controllers'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/middlewares': path.resolve(__dirname, './src/middlewares'),
      '@/routes': path.resolve(__dirname, './src/routes'),
      '@/validators': path.resolve(__dirname, './src/validators'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
    },
  },
});
