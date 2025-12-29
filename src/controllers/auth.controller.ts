import { Request, Response } from 'express';
import { authService } from '../services';
import { sendSuccess, sendError } from '../utils';
import { RegisterInput, LoginInput } from '../validators';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: RegisterInput = req.body;
    const result = await authService.register(data);
    sendSuccess(res, result, 201, 'User registered successfully');
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('duplicate')) {
        sendError(res, 'Email already registered', 409);
      } else {
        sendError(res, 'Registration failed', 500, error.message);
      }
    } else {
      sendError(res, 'Registration failed', 500);
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: LoginInput = req.body;
    const result = await authService.login(data);
    sendSuccess(res, result, 200, 'Login successful');
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, 'Invalid credentials', 401, error.message);
    } else {
      sendError(res, 'Login failed', 500);
    }
  }
};
