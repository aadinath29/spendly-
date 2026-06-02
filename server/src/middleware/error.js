/** 404 handler for unmatched routes. */
export const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
};

/** Central error handler. Maps known DB/JWT errors to friendly messages. */
// eslint-disable-next-line no-unused-vars -- Express needs the 4-arg signature
export const errorHandler = (err, req, res, _next) => {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong.';

  // Duplicate key (e.g. email already registered, duplicate category name).
  if (err.code === 'ER_DUP_ENTRY') {
    status = 409;
    message = 'That record already exists.';
  }
  // Database unreachable.
  if (['ECONNREFUSED', 'ER_ACCESS_DENIED_ERROR', 'ENOTFOUND', 'ER_BAD_DB_ERROR'].includes(err.code)) {
    status = 503;
    message = 'Database is unavailable. Check the server configuration.';
  }

  if (status >= 500) {
    console.error('[error]', err);
  }

  res.status(status).json({ success: false, message });
};
