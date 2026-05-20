import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';

export function errorHandler(error, _req, res, _next) {
  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  const message =
    error instanceof ApiError ? error.message : 'Internal server error';

  if (statusCode >= 500) {
    logger.error(error.message, error.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    details: error.details,
    stack: env.nodeEnv === 'production' ? undefined : error.stack,
  });
}
