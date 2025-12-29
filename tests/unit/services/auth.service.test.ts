import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authService from '@/services/auth.service';
import { User } from '@/models';
import * as hashUtil from '@/utils/hash.util';
import * as jwtUtil from '@/utils/jwt.util';

vi.mock('@/models');
vi.mock('@/utils/hash.util');
vi.mock('@/utils/jwt.util');

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(hashUtil.hashPassword).mockResolvedValue('hashedPassword');
      vi.mocked(User.create).mockResolvedValue(mockUser as any);
      vi.mocked(jwtUtil.generateToken).mockReturnValue('mock-token');

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(hashUtil.hashPassword).toHaveBeenCalledWith('password123');
      expect(User.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashedPassword',
      });
      expect(jwtUtil.generateToken).toHaveBeenCalledWith({
        userId: '123',
        email: 'test@example.com',
      });
      expect(result).toEqual({
        user: {
          id: '123',
          email: 'test@example.com',
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
        token: 'mock-token',
      });
    });

    it('should throw error if user creation fails', async () => {
      vi.mocked(hashUtil.hashPassword).mockResolvedValue('hashedPassword');
      vi.mocked(User.create).mockRejectedValue(new Error('Database error'));

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Database error');
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(User.findOne).mockResolvedValue(mockUser as any);
      vi.mocked(hashUtil.comparePassword).mockResolvedValue(true);
      vi.mocked(jwtUtil.generateToken).mockReturnValue('mock-token');

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(hashUtil.comparePassword).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(jwtUtil.generateToken).toHaveBeenCalledWith({
        userId: '123',
        email: 'test@example.com',
      });
      expect(result).toEqual({
        user: {
          id: '123',
          email: 'test@example.com',
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
        token: 'mock-token',
      });
    });

    it('should throw error if user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if password is invalid', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(User.findOne).mockResolvedValue(mockUser as any);
      vi.mocked(hashUtil.comparePassword).mockResolvedValue(false);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
