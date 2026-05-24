// ============================================================================
// VALIDADOR DE HABITACIONES
// Validaciones exhaustivas para todos los campos de una habitación
// ============================================================================

const { ROOM_RULES, ERROR_MESSAGES } = require('../config/constants');

/**
 * Valida los datos de una habitación para creación
 * @param {Object} data - Datos de la habitación
 * @returns {Array} Array de errores (vacío si es válido)
 */
function validateRoom(data) {
  const errors = [];

  // --- Número de habitación ---
  if (data.numero === undefined || data.numero === null) {
    errors.push({ field: 'numero', message: ERROR_MESSAGES.REQUIRED_FIELD('numero') });
  } else {
    const numero = Number(data.numero);
    if (isNaN(numero)) {
      errors.push({ field: 'numero', message: ERROR_MESSAGES.INVALID_TYPE('numero', 'número') });
    } else if (!Number.isInteger(numero)) {
      errors.push({ field: 'numero', message: ERROR_MESSAGES.VALUE_NOT_INTEGER('numero') });
    } else if (numero < ROOM_RULES.NUMBER_MIN || numero > ROOM_RULES.NUMBER_MAX) {
      errors.push({ field: 'numero', message: ERROR_MESSAGES.VALUE_OUT_OF_RANGE('numero', ROOM_RULES.NUMBER_MIN, ROOM_RULES.NUMBER_MAX) });
    }
  }

  // --- Tipo de habitación ---
  if (data.tipo === undefined || data.tipo === null) {
    errors.push({ field: 'tipo', message: ERROR_MESSAGES.REQUIRED_FIELD('tipo') });
  } else if (typeof data.tipo !== 'string') {
    errors.push({ field: 'tipo', message: ERROR_MESSAGES.INVALID_TYPE('tipo', 'texto') });
  } else {
    const tipo = data.tipo.trim().toLowerCase();
    if (tipo.length === 0) {
      errors.push({ field: 'tipo', message: ERROR_MESSAGES.REQUIRED_FIELD('tipo') });
    } else if (!ROOM_RULES.VALID_TYPES.includes(tipo)) {
      errors.push({ field: 'tipo', message: ERROR_MESSAGES.VALUE_NOT_ALLOWED('tipo', ROOM_RULES.VALID_TYPES) });
    }
  }

  // --- Precio ---
  if (data.precio === undefined || data.precio === null) {
    errors.push({ field: 'precio', message: ERROR_MESSAGES.REQUIRED_FIELD('precio') });
  } else {
    const precio = Number(data.precio);
    if (isNaN(precio)) {
      errors.push({ field: 'precio', message: ERROR_MESSAGES.INVALID_TYPE('precio', 'número') });
    } else if (precio < ROOM_RULES.PRICE_MIN || precio > ROOM_RULES.PRICE_MAX) {
      errors.push({ field: 'precio', message: ERROR_MESSAGES.VALUE_OUT_OF_RANGE('precio', ROOM_RULES.PRICE_MIN, ROOM_RULES.PRICE_MAX) });
    } else {
      // Validar máximo 2 decimales
      const decimalStr = precio.toString();
      const decimalPart = decimalStr.includes('.') ? decimalStr.split('.')[1] : '';
      if (decimalPart.length > 2) {
        errors.push({ field: 'precio', message: 'El precio no puede tener más de 2 decimales' });
      }
    }
  }

  // --- Piso ---
  if (data.piso === undefined || data.piso === null) {
    errors.push({ field: 'piso', message: ERROR_MESSAGES.REQUIRED_FIELD('piso') });
  } else {
    const piso = Number(data.piso);
    if (isNaN(piso)) {
      errors.push({ field: 'piso', message: ERROR_MESSAGES.INVALID_TYPE('piso', 'número') });
    } else if (!Number.isInteger(piso)) {
      errors.push({ field: 'piso', message: ERROR_MESSAGES.VALUE_NOT_INTEGER('piso') });
    } else if (piso < ROOM_RULES.FLOOR_MIN || piso > ROOM_RULES.FLOOR_MAX) {
      errors.push({ field: 'piso', message: ERROR_MESSAGES.VALUE_OUT_OF_RANGE('piso', ROOM_RULES.FLOOR_MIN, ROOM_RULES.FLOOR_MAX) });
    }
  }

  return errors;
}

/**
 * Valida datos parciales para actualización de habitación
 * @param {Object} data - Datos parciales
 * @returns {Array} Array de errores
 */
function validateRoomUpdate(data) {
  const errors = [];

  const validFields = ['numero', 'tipo', 'precio', 'piso', 'estado'];
  const sentFields = Object.keys(data).filter(k => validFields.includes(k));
  if (sentFields.length === 0) {
    errors.push({ field: 'general', message: 'Debe enviar al menos un campo para actualizar' });
    return errors;
  }

  if (data.numero !== undefined) {
    const numero = Number(data.numero);
    if (isNaN(numero)) {
      errors.push({ field: 'numero', message: ERROR_MESSAGES.INVALID_TYPE('numero', 'número') });
    } else if (!Number.isInteger(numero)) {
      errors.push({ field: 'numero', message: ERROR_MESSAGES.VALUE_NOT_INTEGER('numero') });
    } else if (numero < ROOM_RULES.NUMBER_MIN || numero > ROOM_RULES.NUMBER_MAX) {
      errors.push({ field: 'numero', message: ERROR_MESSAGES.VALUE_OUT_OF_RANGE('numero', ROOM_RULES.NUMBER_MIN, ROOM_RULES.NUMBER_MAX) });
    }
  }

  if (data.tipo !== undefined) {
    if (typeof data.tipo !== 'string') {
      errors.push({ field: 'tipo', message: ERROR_MESSAGES.INVALID_TYPE('tipo', 'texto') });
    } else {
      const tipo = data.tipo.trim().toLowerCase();
      if (!ROOM_RULES.VALID_TYPES.includes(tipo)) {
        errors.push({ field: 'tipo', message: ERROR_MESSAGES.VALUE_NOT_ALLOWED('tipo', ROOM_RULES.VALID_TYPES) });
      }
    }
  }

  if (data.precio !== undefined) {
    const precio = Number(data.precio);
    if (isNaN(precio)) {
      errors.push({ field: 'precio', message: ERROR_MESSAGES.INVALID_TYPE('precio', 'número') });
    } else if (precio < ROOM_RULES.PRICE_MIN || precio > ROOM_RULES.PRICE_MAX) {
      errors.push({ field: 'precio', message: ERROR_MESSAGES.VALUE_OUT_OF_RANGE('precio', ROOM_RULES.PRICE_MIN, ROOM_RULES.PRICE_MAX) });
    }
  }

  if (data.piso !== undefined) {
    const piso = Number(data.piso);
    if (isNaN(piso)) {
      errors.push({ field: 'piso', message: ERROR_MESSAGES.INVALID_TYPE('piso', 'número') });
    } else if (!Number.isInteger(piso)) {
      errors.push({ field: 'piso', message: ERROR_MESSAGES.VALUE_NOT_INTEGER('piso') });
    } else if (piso < ROOM_RULES.FLOOR_MIN || piso > ROOM_RULES.FLOOR_MAX) {
      errors.push({ field: 'piso', message: ERROR_MESSAGES.VALUE_OUT_OF_RANGE('piso', ROOM_RULES.FLOOR_MIN, ROOM_RULES.FLOOR_MAX) });
    }
  }

  if (data.estado !== undefined) {
    if (typeof data.estado !== 'string') {
      errors.push({ field: 'estado', message: ERROR_MESSAGES.INVALID_TYPE('estado', 'texto') });
    } else {
      const estado = data.estado.trim().toLowerCase();
      if (!ROOM_RULES.VALID_STATUSES.includes(estado)) {
        errors.push({ field: 'estado', message: ERROR_MESSAGES.VALUE_NOT_ALLOWED('estado', ROOM_RULES.VALID_STATUSES) });
      }
    }
  }

  return errors;
}

module.exports = {
  validateRoom,
  validateRoomUpdate,
};
