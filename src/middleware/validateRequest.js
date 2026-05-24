// ============================================================================
// MIDDLEWARE DE VALIDACIÓN DE REQUEST
// Wrapper genérico que conecta validadores con controladores
// ============================================================================

const { ValidationError } = require('./errorHandler');

/**
 * Crea un middleware de validación a partir de una función validadora
 * @param {Function} validatorFn - Función que recibe body y retorna array de errores
 * @returns {Function} Middleware de Express
 */
function validateRequest(validatorFn) {
  return (req, res, next) => {
    try {
      // Verificar que el body existe y es un objeto
      if (req.body === undefined || req.body === null) {
        throw new ValidationError('El cuerpo de la solicitud está vacío');
      }

      if (typeof req.body !== 'object' || Array.isArray(req.body)) {
        throw new ValidationError('El cuerpo de la solicitud debe ser un objeto JSON válido');
      }

      // Ejecutar el validador específico
      const errors = validatorFn(req.body);

      if (errors.length > 0) {
        throw new ValidationError(
          `Error de validación: ${errors.length} campo(s) inválido(s)`,
          errors
        );
      }

      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        next(error);
      } else {
        // Cualquier error inesperado en la validación se convierte en ValidationError
        next(new ValidationError('Error procesando la solicitud: datos inválidos'));
      }
    }
  };
}

/**
 * Valida que los parámetros de ruta sean válidos
 * @param {string} paramName - Nombre del parámetro
 */
function validateIdParam(paramName = 'id') {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return next(new ValidationError(`El parámetro '${paramName}' es obligatorio`));
    }

    // UUID v4 pattern
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(id.trim())) {
      return next(new ValidationError(`El parámetro '${paramName}' no tiene un formato válido`));
    }

    next();
  };
}

module.exports = {
  validateRequest,
  validateIdParam,
};
