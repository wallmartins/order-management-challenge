import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authController from '@/controllers/auth.controller';
import * as authService from '@/services/auth.service';
import { Request, Response } from 'express';

vi.mock('@/services/auth.service');

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const mockResult = {
        user: {
          id: '123',
          email: 'test@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        token: 'mock-token',
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      vi.mocked(authService.register).mockResolvedValue(mockResult);

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(authService.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'User registered successfully',
      });
    });

    it('should handle duplicate email error', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      const error = new Error('duplicate key error');
      vi.mocked(authService.register).mockRejectedValue(error);

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Email already registered',
      });
    });

    it('should handle generic errors', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      const error = new Error('Database error');
      vi.mocked(authService.register).mockRejectedValue(error);

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Registration failed',
        details: 'Database error',
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      vi.mocked(authService.register).mockRejectedValue('Unknown error');

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Registration failed',
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockResult = {
        user: {
          id: '123',
          email: 'test@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        token: 'mock-token',
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      vi.mocked(authService.login).mockResolvedValue(mockResult);

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Login successful',
      });
    });

    it('should handle invalid credentials error', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const error = new Error('Invalid credentials');
      vi.mocked(authService.login).mockRejectedValue(error);

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid credentials',
        details: 'Invalid credentials',
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      vi.mocked(authService.login).mockRejectedValue('Unknown error');

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Login failed',
      });
    });
  });
});
