import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '@logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors
    });
  }

  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(500).json({ 
    error: 'Internal server error',
    requestId: req.headers['x-request-id'] || 'none'
  });
}
