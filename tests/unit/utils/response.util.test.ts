import { describe, it, expect, vi } from 'vitest';
import { sendSuccess, sendError } from '@/utils/response.util';
import { Response } from 'express';

describe('Response Utility', () => {
  describe('sendSuccess', () => {
    it('should send success response with data', () => {
      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      const data = { id: '123', name: 'Test' };

      sendSuccess(mockResponse, data);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data,
      });
    });

    it('should send success response with custom status code', () => {
      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      const data = { id: '123' };

      sendSuccess(mockResponse, data, 201);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('should send success response with message', () => {
      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      const data = { id: '123' };
      const message = 'Success message';

      sendSuccess(mockResponse, data, 200, message);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data,
        message,
      });
    });

    it('should send success response without message', () => {
      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      const data = { id: '123' };

      sendSuccess(mockResponse, data);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data,
      });
    });
  });

  describe('sendError', () => {
    it('should send error response with default status code', () => {
      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      const error = 'Something went wrong';

      sendError(mockResponse, error);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error,
      });
    });

    it('should send error response with custom status code', () => {
      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      const error = 'Not found';

      sendError(mockResponse, error, 404);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should send error response with details', () => {
      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      const error = 'Validation error';
      const details = { field: 'email', message: 'Invalid email' };

      sendError(mockResponse, error, 400, details);

      expect(mockResponse.json).toHaveBeenCalledWith({
        error,
        details,
      });
    });

    it('should send error response without details', () => {
      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      const error = 'Internal server error';

      sendError(mockResponse, error, 500);

      expect(mockResponse.json).toHaveBeenCalledWith({
        error,
      });
    });
  });
});
