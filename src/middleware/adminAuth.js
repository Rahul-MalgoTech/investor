import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

export function adminAuth(req, _res, next) {
  if (!env.adminToken) {
    next();
    return;
  }

  if (req.header('x-admin-token') === env.adminToken) {
    next();
    return;
  }

  next(new ApiError(401, 'Admin token is invalid'));
}
