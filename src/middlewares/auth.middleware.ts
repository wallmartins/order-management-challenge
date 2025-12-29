import { Response, NextFunction } from 'express';
import { IAuthRequest } from '../types';
import { verifyToken } from '../utils';
import { User } from '../models';
import { sendError } from '../utils';

export const authenticate = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Authentication token is required', 401);
      return;
    }

    const token = authHeader.substring(7);

    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId);

    if (!user) {
      sendError(res, 'User not found', 401);
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    sendError(res, 'Invalid or expired token', 401);
  }
};
