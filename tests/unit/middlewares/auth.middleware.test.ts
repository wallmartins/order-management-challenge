import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticate } from '@/middlewares/auth.middleware';
import { User } from '@/models';
import * as jwtUtil from '@/utils/jwt.util';
import { Request, Response, NextFunction } from 'express';

vi.mock('@/models');
vi.mock('@/utils/jwt.util');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = {
      headers: {},
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();
  });

  describe('authenticate', () => {
    it('should authenticate user with valid token', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      vi.mocked(jwtUtil.verifyToken).mockReturnValue({
        userId: '123',
        email: 'test@example.com',
      });
      vi.mocked(User.findById).mockResolvedValue(mockUser as any);

      await authenticate(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(jwtUtil.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(User.findById).toHaveBeenCalledWith('123');
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject request without authorization header', async () => {
      mockRequest.headers = {};

      await authenticate(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Authentication token is required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with invalid authorization format', async () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token',
      };

      await authenticate(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Authentication token is required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      vi.mocked(jwtUtil.verifyToken).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authenticate(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request if user not found', async () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      vi.mocked(jwtUtil.verifyToken).mockReturnValue({
        userId: '123',
        email: 'test@example.com',
      });
      vi.mocked(User.findById).mockResolvedValue(null);

      await authenticate(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'User not found',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
