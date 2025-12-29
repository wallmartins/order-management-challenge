import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";
import { sendError } from "../utils";

export const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        sendError(res, "Validation error", 400, error.issues);
      } else {
        sendError(res, "Invalid request data", 400);
      }
    }
  };
};

export const validateQuery = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      sendError(res, "Validation error", 400, result.error.issues);
      return;
    }

    (req as any).validatedQuery = result.data;
    next();
  };
};
