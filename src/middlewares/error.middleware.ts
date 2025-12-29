import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils';

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', error);

  if (error.name === 'ValidationError') {
    sendError(res, 'Validation error', 400, error.message);
    return;
  }

  if (error.name === 'MongoServerError' && 'code' in error && error.code === 11000) {
    sendError(res, 'Duplicate key error', 409, 'Resource already exists');
    return;
  }

  sendError(res, 'Internal server error', 500, error.message);
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  sendError(res, 'Route not found', 404);
};
