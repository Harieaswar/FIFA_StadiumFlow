import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const isProd = process.env.NODE_ENV === 'production';
  const statusCode = (err as AppError).statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && isProd
      ? 'Internal server error. Please try again later.'
      : err.message,
    ...((!isProd && statusCode === 500) && { stack: err.stack }),
  });
};
