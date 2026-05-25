import { logger } from '../config/logger.js';

export function errorHandler(err, _req, res, _next) {
  logger.error(err.message ?? String(err));
  const status = err.status ?? err.statusCode ?? 500;
  res.status(status).json({
    success: false,
    error: status === 500 ? 'Internal server error' : err.message,
    code: err.code ?? 'INTERNAL_ERROR',
  });
}
