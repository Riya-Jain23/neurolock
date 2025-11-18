import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(JSON.stringify({ level: 'error', msg: err.message, stack: err.stack }));
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
};

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
};