// ============================================================================
// VALIDADOR DE RESERVACIONES
// Validaciones exhaustivas para fechas, huéspedes y reglas de negocio
// ============================================================================

const { RESERVATION_RULES, ROOM_RULES, ERROR_MESSAGES } = require('../config/constants');

/**
 * Verifica si una fecha tiene formato YYYY-MM-DD válido y es una fecha real
 * @param {string} dateStr - Fecha en formato string
 * @returns {boolean}
 */
function isValidDateFormat(dateStr) {
  if (typeof dateStr !== 'string') return false;

  const pattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!pattern.test(dateStr)) return false;

  const [year, month, day] = dateStr.split('-').map(Number);

  // Verificar rangos básicos
  if (year < 2020 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  // Verificar días por mes (incluye bisiesto)
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) return false;

  // Verificar que la fecha parseada sea la misma
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return false;

  return true;
}

/**
 * Obtiene la fecha de hoy en formato YYYY-MM-DD (hora local)
 * @returns {string}
 */
function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calcula la diferencia en días entre dos fechas
 * @param {string} dateStr1 - Fecha inicio (YYYY-MM-DD)
 * @param {string} dateStr2 - Fecha fin (YYYY-MM-DD)
 * @returns {number} Diferencia en días
 */
function daysBetween(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1 + 'T00:00:00');
  const d2 = new Date(dateStr2 + 'T00:00:00');
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Valida los datos de una reservación para creación
 * @param {Object} data - Datos de la reservación
 * @returns {Array} Array de errores
 */
function validateReservation(data) {
  const errors = [];

  // --- ID del huésped ---
  if (data.huespedId === undefined || data.huespedId === null) {
    errors.push({ field: 'huespedId', message: ERROR_MESSAGES.REQUIRED_FIELD('huespedId') });
  } else if (typeof data.huespedId !== 'string' || data.huespedId.trim().length === 0) {
    errors.push({ field: 'huespedId', message: ERROR_MESSAGES.INVALID_FORMAT('huespedId') });
  }

  // --- ID de la habitación ---
  if (data.habitacionId === undefined || data.habitacionId === null) {
    errors.push({ field: 'habitacionId', message: ERROR_MESSAGES.REQUIRED_FIELD('habitacionId') });
  } else if (typeof data.habitacionId !== 'string' || data.habitacionId.trim().length === 0) {
    errors.push({ field: 'habitacionId', message: ERROR_MESSAGES.INVALID_FORMAT('habitacionId') });
  }

  // --- Fecha de check-in ---
  if (data.fechaCheckIn === undefined || data.fechaCheckIn === null) {
    errors.push({ field: 'fechaCheckIn', message: ERROR_MESSAGES.REQUIRED_FIELD('fechaCheckIn') });
  } else if (!isValidDateFormat(data.fechaCheckIn)) {
    errors.push({ field: 'fechaCheckIn', message: ERROR_MESSAGES.INVALID_FORMAT('fechaCheckIn') + '. Use formato YYYY-MM-DD' });
  } else {
    const today = getTodayString();
    if (data.fechaCheckIn < today) {
      errors.push({ field: 'fechaCheckIn', message: ERROR_MESSAGES.RESERVATION_PAST_CHECKIN });
    }
  }

  // --- Fecha de check-out ---
  if (data.fechaCheckOut === undefined || data.fechaCheckOut === null) {
    errors.push({ field: 'fechaCheckOut', message: ERROR_MESSAGES.REQUIRED_FIELD('fechaCheckOut') });
  } else if (!isValidDateFormat(data.fechaCheckOut)) {
    errors.push({ field: 'fechaCheckOut', message: ERROR_MESSAGES.INVALID_FORMAT('fechaCheckOut') + '. Use formato YYYY-MM-DD' });
  }

  // --- Validación cruzada de fechas ---
  if (data.fechaCheckIn && data.fechaCheckOut &&
      isValidDateFormat(data.fechaCheckIn) && isValidDateFormat(data.fechaCheckOut)) {
    if (data.fechaCheckOut <= data.fechaCheckIn) {
      errors.push({ field: 'fechaCheckOut', message: ERROR_MESSAGES.RESERVATION_INVALID_DATES });
    } else {
      const nights = daysBetween(data.fechaCheckIn, data.fechaCheckOut);
      if (nights > RESERVATION_RULES.MAX_NIGHTS) {
        errors.push({ field: 'fechaCheckOut', message: ERROR_MESSAGES.RESERVATION_MAX_NIGHTS(RESERVATION_RULES.MAX_NIGHTS) });
      }
    }
  }

  // --- Número de huéspedes ---
  if (data.numHuespedes === undefined || data.numHuespedes === null) {
    errors.push({ field: 'numHuespedes', message: ERROR_MESSAGES.REQUIRED_FIELD('numHuespedes') });
  } else {
    const num = Number(data.numHuespedes);
    if (isNaN(num)) {
      errors.push({ field: 'numHuespedes', message: ERROR_MESSAGES.INVALID_TYPE('numHuespedes', 'número') });
    } else if (!Number.isInteger(num)) {
      errors.push({ field: 'numHuespedes', message: ERROR_MESSAGES.VALUE_NOT_INTEGER('numHuespedes') });
    } else if (num < RESERVATION_RULES.GUESTS_MIN || num > RESERVATION_RULES.GUESTS_MAX) {
      errors.push({ field: 'numHuespedes', message: ERROR_MESSAGES.VALUE_OUT_OF_RANGE('numHuespedes', RESERVATION_RULES.GUESTS_MIN, RESERVATION_RULES.GUESTS_MAX) });
    }
  }

  return errors;
}

module.exports = {
  validateReservation,
  isValidDateFormat,
  getTodayString,
  daysBetween,
};
