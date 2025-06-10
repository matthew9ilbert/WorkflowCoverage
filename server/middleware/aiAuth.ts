import { Request, Response, NextFunction } from 'express';
import { logger } from '@logger';
import { User } from '@shared/types';

export function verifyAIAccess(req: Request, res: Response, next: NextFunction) {
  try {
    // API Key Check
    const apiKey = req.headers['x-ai-api-key'];
    if (apiKey !== process.env.AI_API_KEY) {
      logger.warn('Invalid AI API key attempt');
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Role Check
    const userRoles = req.user?.roles || [];
    const allowedRoles = ['owner', 'admin', 'ai-specialist'];
    const hasAccess = allowedRoles.some(role => userRoles.includes(role));
    
    if (!hasAccess) {
      logger.warn(`Unauthorized AI access attempt by ${req.user?.id}`);
      return res.status(403).json({ error: 'Insufficient privileges' });
    }
    
    next();
  } catch (err) {
    logger.error('AI Auth middleware error', { error: err });
    res.status(500).json({ error: 'Authentication failed' });
  }
}
