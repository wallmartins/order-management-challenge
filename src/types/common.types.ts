import { Request } from 'express';
import { IUserDocument } from './user.types';

export interface IAuthRequest extends Request {
  user?: IUserDocument;
}

export interface IErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
}

export interface ISuccessResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}
