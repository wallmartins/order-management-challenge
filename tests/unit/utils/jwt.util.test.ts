import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateToken, verifyToken } from '@/utils/jwt.util';
import jwt from 'jsonwebtoken';

vi.mock('@/config', () => ({
  env: {
    jwtSecret: 'test-secret',
    jwtExpiresIn: '1d',
  },
}));

describe('JWT Utility', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = {
        userId: '123',
        email: 'test@example.com',
      };

      const token = generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should generate token with correct payload', () => {
      const payload = {
        userId: '123',
        email: 'test@example.com',
      };

      const token = generateToken(payload);
      const decoded = jwt.verify(token, 'test-secret') as any;

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const payload = {
        userId: '123',
        email: 'test@example.com',
      };

      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => verifyToken(invalidToken)).toThrow();
    });

    it('should throw error for expired token', () => {
      const expiredToken = jwt.sign(
        { userId: '123', email: 'test@example.com' },
        'test-secret',
        { expiresIn: '-1s' }
      );

      expect(() => verifyToken(expiredToken)).toThrow();
    });

    it('should throw error for token with wrong secret', () => {
      const wrongSecretToken = jwt.sign(
        { userId: '123', email: 'test@example.com' },
        'wrong-secret'
      );

      expect(() => verifyToken(wrongSecretToken)).toThrow();
    });
  });
});
