import { validationResult } from 'express-validator';

/**
 * Runs after a list of express-validator checks. If any failed, responds 422
 * with the first message; otherwise passes control on.
 */
export const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array();
  return res.status(422).json({
    success: false,
    message: errors[0].msg,
    errors: errors.map((e) => ({ field: e.path, message: e.msg })),
  });
};
