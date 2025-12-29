import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '@/models';

describe('User Model', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('User Schema', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedPassword123',
      };

      const user = await User.create(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.password).toBe('hashedPassword123');
      expect(user._id).toBeDefined();
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should enforce unique email constraint', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedPassword123',
      };

      await User.create(userData);

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should require email field', async () => {
      const userData = {
        password: 'hashedPassword123',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should require password field', async () => {
      const userData = {
        email: 'test@example.com',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should lowercase email', async () => {
      const userData = {
        email: 'TEST@EXAMPLE.COM',
        password: 'hashedPassword123',
      };

      const user = await User.create(userData);

      expect(user.email).toBe('test@example.com');
    });

    it('should trim email whitespace', async () => {
      const userData = {
        email: '  test@example.com  ',
        password: 'hashedPassword123',
      };

      const user = await User.create(userData);

      expect(user.email).toBe('test@example.com');
    });

    it('should have timestamps', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedPassword123',
      };

      const user = await User.create(userData);

      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on modification', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedPassword123',
      };

      const user = await User.create(userData);
      const originalUpdatedAt = user.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      user.password = 'newHashedPassword';
      await user.save();

      expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
