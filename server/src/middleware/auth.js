import jwt from 'jsonwebtoken';
import { httpError } from '../utils/errors.js';

/**
 * Verifies the `Authorization: Bearer <token>` header and attaches the decoded
 * user (`{ id, email }`) to `req.user`. Rejects with 401 if missing/invalid.
 */
export const requireAuth = (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(httpError(401, 'Authentication required.'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(httpError(401, 'Invalid or expired session. Please log in again.'));
  }
};
