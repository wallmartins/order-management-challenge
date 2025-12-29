import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '@/utils/hash.util';

describe('Hash Utility', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'password123';
      const hashed = await hashPassword(password);

      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe('string');
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'password123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should hash different passwords differently', async () => {
      const password1 = 'password123';
      const password2 = 'password456';

      const hash1 = await hashPassword(password1);
      const hash2 = await hashPassword(password2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'password123';
      const hashed = await hashPassword(password);

      const isMatch = await comparePassword(password, hashed);

      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'password123';
      const wrongPassword = 'wrongpassword';
      const hashed = await hashPassword(password);

      const isMatch = await comparePassword(wrongPassword, hashed);

      expect(isMatch).toBe(false);
    });

    it('should return false for empty password', async () => {
      const password = 'password123';
      const hashed = await hashPassword(password);

      const isMatch = await comparePassword('', hashed);

      expect(isMatch).toBe(false);
    });
  });
});
