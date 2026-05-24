// ============================================================================
// VALIDADOR DE FACTURACIÓN
// Validaciones exhaustivas para métodos de pago, descuentos y montos
// ============================================================================

const { BILLING_RULES, ERROR_MESSAGES } = require('../config/constants');

/**
 * Valida los datos de una factura para creación
 * @param {Object} data - Datos de la factura
 * @returns {Array} Array de errores
 */
function validateBilling(data) {
  const errors = [];

  // --- ID de la reservación ---
  if (data.reservacionId === undefined || data.reservacionId === null) {
    errors.push({ field: 'reservacionId', message: ERROR_MESSAGES.REQUIRED_FIELD('reservacionId') });
  } else if (typeof data.reservacionId !== 'string' || data.reservacionId.trim().length === 0) {
    errors.push({ field: 'reservacionId', message: ERROR_MESSAGES.INVALID_FORMAT('reservacionId') });
  }

  // --- Método de pago ---
  if (data.metodoPago === undefined || data.metodoPago === null) {
    errors.push({ field: 'metodoPago', message: ERROR_MESSAGES.REQUIRED_FIELD('metodoPago') });
  } else if (typeof data.metodoPago !== 'string') {
    errors.push({ field: 'metodoPago', message: ERROR_MESSAGES.INVALID_TYPE('metodoPago', 'texto') });
  } else {
    const metodo = data.metodoPago.trim().toLowerCase();
    if (metodo.length === 0) {
      errors.push({ field: 'metodoPago', message: ERROR_MESSAGES.REQUIRED_FIELD('metodoPago') });
    } else if (!BILLING_RULES.VALID_PAYMENT_METHODS.includes(metodo)) {
      errors.push({ field: 'metodoPago', message: ERROR_MESSAGES.VALUE_NOT_ALLOWED('metodoPago', BILLING_RULES.VALID_PAYMENT_METHODS) });
    }
  }

  // --- Descuento adicional (opcional) ---
  if (data.descuento !== undefined && data.descuento !== null) {
    const descuento = Number(data.descuento);
    if (isNaN(descuento)) {
      errors.push({ field: 'descuento', message: ERROR_MESSAGES.INVALID_TYPE('descuento', 'número') });
    } else if (descuento < BILLING_RULES.DISCOUNT_MIN || descuento > BILLING_RULES.DISCOUNT_MAX) {
      errors.push({ field: 'descuento', message: ERROR_MESSAGES.VALUE_OUT_OF_RANGE('descuento', BILLING_RULES.DISCOUNT_MIN, BILLING_RULES.DISCOUNT_MAX) });
    }
  }

  return errors;
}

/**
 * Valida actualización de estado de factura
 * @param {Object} data - Datos de actualización
 * @returns {Array} Array de errores
 */
function validateBillingUpdate(data) {
  const errors = [];

  if (data.estado === undefined || data.estado === null) {
    errors.push({ field: 'estado', message: ERROR_MESSAGES.REQUIRED_FIELD('estado') });
  } else if (typeof data.estado !== 'string') {
    errors.push({ field: 'estado', message: ERROR_MESSAGES.INVALID_TYPE('estado', 'texto') });
  } else {
    const estado = data.estado.trim().toLowerCase();
    if (!BILLING_RULES.VALID_STATUSES.includes(estado)) {
      errors.push({ field: 'estado', message: ERROR_MESSAGES.VALUE_NOT_ALLOWED('estado', BILLING_RULES.VALID_STATUSES) });
    }
  }

  return errors;
}

module.exports = {
  validateBilling,
  validateBillingUpdate,
};
