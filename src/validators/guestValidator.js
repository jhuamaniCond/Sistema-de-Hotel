// ============================================================================
// VALIDADOR DE HUÉSPEDES
// Validaciones exhaustivas para todos los campos de un huésped
// ============================================================================

const { GUEST_RULES, ERROR_MESSAGES } = require('../config/constants');

/**
 * Sanitiza un string: trim y elimina espacios múltiples
 */
function sanitizeString(value) {
  if (typeof value !== 'string') return value;
  return value.trim().replace(/\s+/g, ' ');
}

/**
 * Valida los datos de un huésped para creación
 * @param {Object} data - Datos del huésped
 * @returns {Array} Array de errores (vacío si es válido)
 */
function validateGuest(data) {
  const errors = [];

  // --- Nombre ---
  if (data.nombre === undefined || data.nombre === null) {
    errors.push({ field: 'nombre', message: ERROR_MESSAGES.REQUIRED_FIELD('nombre') });
  } else if (typeof data.nombre !== 'string') {
    errors.push({ field: 'nombre', message: ERROR_MESSAGES.INVALID_TYPE('nombre', 'texto') });
  } else {
    const nombre = sanitizeString(data.nombre);
    if (nombre.length === 0) {
      errors.push({ field: 'nombre', message: ERROR_MESSAGES.REQUIRED_FIELD('nombre') });
    } else if (nombre.length < GUEST_RULES.NAME_MIN_LENGTH) {
      errors.push({ field: 'nombre', message: ERROR_MESSAGES.FIELD_TOO_SHORT('nombre', GUEST_RULES.NAME_MIN_LENGTH) });
    } else if (nombre.length > GUEST_RULES.NAME_MAX_LENGTH) {
      errors.push({ field: 'nombre', message: ERROR_MESSAGES.FIELD_TOO_LONG('nombre', GUEST_RULES.NAME_MAX_LENGTH) });
    } else if (!GUEST_RULES.NAME_PATTERN.test(nombre)) {
      errors.push({ field: 'nombre', message: ERROR_MESSAGES.GUEST_NAME_INVALID });
    }
  }

  // --- DNI ---
  if (data.dni === undefined || data.dni === null) {
    errors.push({ field: 'dni', message: ERROR_MESSAGES.REQUIRED_FIELD('dni') });
  } else {
    const dni = String(data.dni).trim();
    if (dni.length === 0) {
      errors.push({ field: 'dni', message: ERROR_MESSAGES.REQUIRED_FIELD('dni') });
    } else if (!GUEST_RULES.DNI_PATTERN.test(dni)) {
      errors.push({ field: 'dni', message: ERROR_MESSAGES.GUEST_DNI_INVALID });
    }
  }

  // --- Edad ---
  if (data.edad === undefined || data.edad === null) {
    errors.push({ field: 'edad', message: ERROR_MESSAGES.REQUIRED_FIELD('edad') });
  } else {
    const edad = Number(data.edad);
    if (isNaN(edad)) {
      errors.push({ field: 'edad', message: ERROR_MESSAGES.INVALID_TYPE('edad', 'número') });
    } else if (!Number.isInteger(edad)) {
      errors.push({ field: 'edad', message: ERROR_MESSAGES.VALUE_NOT_INTEGER('edad') });
    } else if (edad < GUEST_RULES.AGE_MIN || edad > GUEST_RULES.AGE_MAX) {
      errors.push({ field: 'edad', message: ERROR_MESSAGES.VALUE_OUT_OF_RANGE('edad', GUEST_RULES.AGE_MIN, GUEST_RULES.AGE_MAX) });
    }
  }

  // --- Teléfono ---
  if (data.telefono === undefined || data.telefono === null) {
    errors.push({ field: 'telefono', message: ERROR_MESSAGES.REQUIRED_FIELD('telefono') });
  } else {
    const telefono = String(data.telefono).trim();
    if (telefono.length === 0) {
      errors.push({ field: 'telefono', message: ERROR_MESSAGES.REQUIRED_FIELD('telefono') });
    } else if (!GUEST_RULES.PHONE_PATTERN.test(telefono)) {
      errors.push({ field: 'telefono', message: ERROR_MESSAGES.GUEST_PHONE_INVALID });
    }
  }

  // --- Email ---
  if (data.email === undefined || data.email === null) {
    errors.push({ field: 'email', message: ERROR_MESSAGES.REQUIRED_FIELD('email') });
  } else if (typeof data.email !== 'string') {
    errors.push({ field: 'email', message: ERROR_MESSAGES.INVALID_TYPE('email', 'texto') });
  } else {
    const email = data.email.trim().toLowerCase();
    if (email.length === 0) {
      errors.push({ field: 'email', message: ERROR_MESSAGES.REQUIRED_FIELD('email') });
    } else if (email.length > GUEST_RULES.EMAIL_MAX_LENGTH) {
      errors.push({ field: 'email', message: ERROR_MESSAGES.FIELD_TOO_LONG('email', GUEST_RULES.EMAIL_MAX_LENGTH) });
    } else if (!GUEST_RULES.EMAIL_PATTERN.test(email)) {
      errors.push({ field: 'email', message: ERROR_MESSAGES.GUEST_EMAIL_INVALID });
    }
  }

  return errors;
}

/**
 * Valida datos parciales para actualización de huésped
 * Solo valida los campos que se envían
 * @param {Object} data - Datos parciales del huésped
 * @returns {Array} Array de errores
 */
function validateGuestUpdate(data) {
  const errors = [];

  // Verificar que al menos un campo se envía
  const validFields = ['nombre', 'dni', 'edad', 'telefono', 'email'];
  const sentFields = Object.keys(data).filter(k => validFields.includes(k));
  if (sentFields.length === 0) {
    errors.push({ field: 'general', message: 'Debe enviar al menos un campo para actualizar' });
    return errors;
  }

  // Validar solo los campos enviados
  if (data.nombre !== undefined) {
    if (data.nombre === null || typeof data.nombre !== 'string') {
      errors.push({ field: 'nombre', message: ERROR_MESSAGES.INVALID_TYPE('nombre', 'texto') });
    } else {
      const nombre = sanitizeString(data.nombre);
      if (nombre.length < GUEST_RULES.NAME_MIN_LENGTH) {
        errors.push({ field: 'nombre', message: ERROR_MESSAGES.FIELD_TOO_SHORT('nombre', GUEST_RULES.NAME_MIN_LENGTH) });
      } else if (nombre.length > GUEST_RULES.NAME_MAX_LENGTH) {
        errors.push({ field: 'nombre', message: ERROR_MESSAGES.FIELD_TOO_LONG('nombre', GUEST_RULES.NAME_MAX_LENGTH) });
      } else if (!GUEST_RULES.NAME_PATTERN.test(nombre)) {
        errors.push({ field: 'nombre', message: ERROR_MESSAGES.GUEST_NAME_INVALID });
      }
    }
  }

  if (data.dni !== undefined) {
    const dni = String(data.dni).trim();
    if (!GUEST_RULES.DNI_PATTERN.test(dni)) {
      errors.push({ field: 'dni', message: ERROR_MESSAGES.GUEST_DNI_INVALID });
    }
  }

  if (data.edad !== undefined) {
    const edad = Number(data.edad);
    if (isNaN(edad)) {
      errors.push({ field: 'edad', message: ERROR_MESSAGES.INVALID_TYPE('edad', 'número') });
    } else if (!Number.isInteger(edad)) {
      errors.push({ field: 'edad', message: ERROR_MESSAGES.VALUE_NOT_INTEGER('edad') });
    } else if (edad < GUEST_RULES.AGE_MIN || edad > GUEST_RULES.AGE_MAX) {
      errors.push({ field: 'edad', message: ERROR_MESSAGES.VALUE_OUT_OF_RANGE('edad', GUEST_RULES.AGE_MIN, GUEST_RULES.AGE_MAX) });
    }
  }

  if (data.telefono !== undefined) {
    const telefono = String(data.telefono).trim();
    if (!GUEST_RULES.PHONE_PATTERN.test(telefono)) {
      errors.push({ field: 'telefono', message: ERROR_MESSAGES.GUEST_PHONE_INVALID });
    }
  }

  if (data.email !== undefined) {
    if (typeof data.email !== 'string') {
      errors.push({ field: 'email', message: ERROR_MESSAGES.INVALID_TYPE('email', 'texto') });
    } else {
      const email = data.email.trim().toLowerCase();
      if (email.length > GUEST_RULES.EMAIL_MAX_LENGTH) {
        errors.push({ field: 'email', message: ERROR_MESSAGES.FIELD_TOO_LONG('email', GUEST_RULES.EMAIL_MAX_LENGTH) });
      } else if (!GUEST_RULES.EMAIL_PATTERN.test(email)) {
        errors.push({ field: 'email', message: ERROR_MESSAGES.GUEST_EMAIL_INVALID });
      }
    }
  }

  return errors;
}

module.exports = {
  validateGuest,
  validateGuestUpdate,
  sanitizeString,
};
