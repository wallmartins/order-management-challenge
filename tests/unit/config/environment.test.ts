import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Environment Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
  });

  it('should have nodeEnv property', async () => {
    const { env } = await import('@/config/environment');
    expect(env.nodeEnv).toBeDefined();
    expect(typeof env.nodeEnv).toBe('string');
  });

  it('should use default nodeEnv when NODE_ENV is not set', async () => {
    delete process.env.NODE_ENV;
    vi.resetModules();
    const { env } = await import('@/config/environment');
    expect(env.nodeEnv).toBe('development');
  });

  it('should have port as number', async () => {
    const { env } = await import('@/config/environment');
    expect(env.port).toBeDefined();
    expect(typeof env.port).toBe('number');
  });

  it('should have mongoUri property', async () => {
    const { env } = await import('@/config/environment');
    expect(env.mongoUri).toBeDefined();
    expect(typeof env.mongoUri).toBe('string');
  });

  it('should have jwtSecret property', async () => {
    const { env } = await import('@/config/environment');
    expect(env.jwtSecret).toBeDefined();
    expect(typeof env.jwtSecret).toBe('string');
  });

  it('should have jwtExpiresIn property', async () => {
    const { env } = await import('@/config/environment');
    expect(env.jwtExpiresIn).toBeDefined();
    expect(typeof env.jwtExpiresIn).toBe('string');
  });

  it('should be a const object', async () => {
    const { env } = await import('@/config/environment');
    expect(env).toBeDefined();
    expect(typeof env).toBe('object');
  });
});
