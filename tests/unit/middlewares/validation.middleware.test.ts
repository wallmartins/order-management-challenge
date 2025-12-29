import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validate, validateQuery } from '@/middlewares/validation.middleware';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();
  });

  describe('validate', () => {
    it('should call next() with valid data', () => {
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
      });

      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return validation error for invalid data', () => {
      const schema = z.object({
        email: z.string().email(),
      });

      mockRequest.body = {
        email: 'invalid-email',
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle missing required fields', () => {
      const schema = z.object({
        email: z.string(),
        password: z.string(),
      });

      mockRequest.body = {
        email: 'test@example.com',
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle non-ZodError exceptions', () => {
      const schema = {
        parse: vi.fn().mockImplementation(() => {
          throw new Error('Non-Zod error');
        }),
      } as any;

      mockRequest.body = {};

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid request data',
      });
    });
  });

  describe('validateQuery', () => {
    it('should call next() with valid query data', () => {
      const schema = z.object({
        page: z.string().optional(),
      });

      mockRequest.query = {
        page: '1',
      };

      const middleware = validateQuery(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return validation error for invalid query', () => {
      const schema = z.object({
        state: z.enum(['CREATED', 'ANALYSIS', 'COMPLETED']),
      });

      mockRequest.query = {
        state: 'INVALID',
      };

      const middleware = validateQuery(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should store validated data in request.validatedQuery', () => {
      const schema = z.object({
        page: z.string().transform((val) => parseInt(val, 10)),
      });

      mockRequest.query = {
        page: '5',
      };

      const middleware = validateQuery(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect((mockRequest as any).validatedQuery).toEqual({ page: 5 });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle non-ZodError exceptions', () => {
      const schema = {
        safeParse: vi.fn().mockReturnValue({
          success: false,
          error: new Error('Non-Zod error'),
        }),
      } as any;

      mockRequest.query = {};

      const middleware = validateQuery(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });
});
