// ============================================================================
// MIDDLEWARE GLOBAL DE MANEJO DE ERRORES
// Captura TODOS los errores y responde con formato JSON consistente
// ============================================================================

const { ERROR_MESSAGES } = require('../config/constants');

/**
 * Clase base para errores de la aplicación
 */
class AppError extends Error {
  constructor(message, statusCode, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error de validación (400)
 */
class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400, errors);
    this.name = 'ValidationError';
  }
}

/**
 * Error de recurso no encontrado (404)
 */
class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Error de conflicto / duplicado (409)
 */
class ConflictError extends AppError {
  constructor(message) {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * Error de regla de negocio (422)
 */
class BusinessError extends AppError {
  constructor(message) {
    super(message, 422);
    this.name = 'BusinessError';
  }
}

/**
 * Middleware para manejar JSON malformado
 */
function handleJsonParseError(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: ERROR_MESSAGES.INVALID_JSON,
      details: [],
    });
  }
  next(err);
}

/**
 * Middleware global de errores
 * SIEMPRE devuelve JSON, NUNCA expone stack traces
 */
function globalErrorHandler(err, req, res, _next) {
  // Log interno (solo en desarrollo)
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[ERROR] ${new Date().toISOString()} - ${err.name}: ${err.message}`);
  }

  // Si es un error operacional conocido
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.name,
      message: err.message,
      details: err.errors || [],
    });
  }

  // Error inesperado - nunca exponer detalles internos
  return res.status(500).json({
    success: false,
    error: 'InternalError',
    message: ERROR_MESSAGES.INTERNAL_ERROR,
    details: [],
  });
}

/**
 * Middleware para rutas no encontradas (404)
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'NotFoundError',
    message: ERROR_MESSAGES.ROUTE_NOT_FOUND,
    details: [],
  });
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  BusinessError,
  handleJsonParseError,
  globalErrorHandler,
  notFoundHandler,
};
