/**
 * Centralized error handler middleware
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const field = err.field || undefined;

  console.error(`[Error] ${req.method} ${req.url} (${statusCode}):`, message);

  res.status(statusCode).json({
    error: {
      message,
      ...(field && { field }),
    },
  });
}

module.exports = errorHandler;
