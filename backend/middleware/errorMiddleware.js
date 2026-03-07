// backend/middleware/errorMiddleware.js
// ─────────────────────────────────────────────────────────────────────────────
// Global error handling middleware
// Two handlers: notFound (404) and errorHandler (all other errors)
// ─────────────────────────────────────────────────────────────────────────────

// ── 404 – Route not found ─────────────────────────────────────────────────────
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// ── Global error handler ──────────────────────────────────────────────────────
const errorHandler = (err, req, res, next) => {
  // Mongoose sometimes sets 200 even on error – default to 500
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // ── Mongoose: CastError (invalid ObjectId) ────────────────────────────────
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found – invalid ID format";
  }

  // ── Mongoose: Duplicate key (unique constraint violated) ──────────────────
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value: "${err.keyValue[field]}" already exists for ${field}`;
  }

  // ── Mongoose: Validation error ────────────────────────────────────────────
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // ── JWT errors ────────────────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired – please log in again";
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Only show stack trace in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
