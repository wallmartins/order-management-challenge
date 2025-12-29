import { Response } from 'express';
import { ISuccessResponse, IErrorResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  message?: string
): Response => {
  const response: ISuccessResponse<T> = {
    success: true,
    data,
    message,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  error: string,
  statusCode = 500,
  details?: unknown
): Response => {
  const response: IErrorResponse = {
    error,
    message: undefined,
    details,
  };
  return res.status(statusCode).json(response);
};
