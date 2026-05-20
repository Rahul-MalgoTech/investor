import { ApiError } from '../utils/apiError.js';
import { verifyAuthToken } from '../utils/jwt.js';

export function authenticate(req, _res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authorization token is required'));
  }

  try {
    req.auth = verifyAuthToken(header.slice('Bearer '.length));
    return next();
  } catch (_error) {
    return next(new ApiError(401, 'Invalid authorization token'));
  }
}
