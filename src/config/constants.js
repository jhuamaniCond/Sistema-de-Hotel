// ============================================================================
// CONSTANTES DEL SISTEMA DE GESTIÓN DE HOTEL
// Todas las reglas de validación centralizadas para consistencia
// ============================================================================

const GUEST_RULES = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  NAME_PATTERN: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,

  DNI_LENGTH: 8,
  DNI_PATTERN: /^\d{8}$/,

  AGE_MIN: 18,
  AGE_MAX: 120,

  PHONE_LENGTH: 9,
  PHONE_PATTERN: /^9\d{8}$/,

  EMAIL_PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  EMAIL_MAX_LENGTH: 254,
};

const ROOM_RULES = {
  NUMBER_MIN: 100,
  NUMBER_MAX: 999,

  VALID_TYPES: ['individual', 'doble', 'suite'],

  PRICE_MIN: 50.0,
  PRICE_MAX: 5000.0,

  FLOOR_MIN: 1,
  FLOOR_MAX: 20,

  VALID_STATUSES: ['disponible', 'ocupada', 'mantenimiento'],

  // Capacidad máxima por tipo de habitación
  MAX_GUESTS_BY_TYPE: {
    individual: 1,
    doble: 2,
    suite: 4,
  },

  // Precios base por tipo de habitación
  BASE_PRICE: {
    individual: 80.0,
    doble: 150.0,
    suite: 350.0,
  },
};

const RESERVATION_RULES = {
  MAX_NIGHTS: 365,
  MIN_NIGHTS: 1,

  GUESTS_MIN: 1,
  GUESTS_MAX: 4,

  VALID_STATUSES: ['confirmada', 'cancelada', 'completada', 'pendiente'],

  // Descuento por estadía prolongada (>= 7 noches)
  LONG_STAY_THRESHOLD: 7,
  LONG_STAY_DISCOUNT: 10, // 10%

  // Descuento por estadía muy larga (>= 30 noches)
  EXTRA_LONG_STAY_THRESHOLD: 30,
  EXTRA_LONG_STAY_DISCOUNT: 20, // 20%
};

const BILLING_RULES = {
  VALID_PAYMENT_METHODS: ['efectivo', 'tarjeta', 'transferencia'],

  DISCOUNT_MIN: 0,
  DISCOUNT_MAX: 50,

  TAX_RATE: 18, // IGV 18%

  VALID_STATUSES: ['pendiente', 'pagada', 'anulada'],
};

const ERROR_MESSAGES = {
  // Generales
  REQUIRED_FIELD: (field) => `El campo '${field}' es obligatorio`,
  INVALID_TYPE: (field, expected) => `El campo '${field}' debe ser de tipo ${expected}`,
  FIELD_TOO_SHORT: (field, min) => `El campo '${field}' debe tener al menos ${min} caracteres`,
  FIELD_TOO_LONG: (field, max) => `El campo '${field}' no debe exceder ${max} caracteres`,
  VALUE_OUT_OF_RANGE: (field, min, max) => `El campo '${field}' debe estar entre ${min} y ${max}`,
  INVALID_FORMAT: (field) => `El campo '${field}' tiene un formato inválido`,
  VALUE_NOT_INTEGER: (field) => `El campo '${field}' debe ser un número entero`,
  VALUE_NOT_ALLOWED: (field, allowed) => `El campo '${field}' debe ser uno de: ${allowed.join(', ')}`,

  // Huéspedes
  GUEST_NOT_FOUND: 'Huésped no encontrado',
  GUEST_DNI_EXISTS: 'Ya existe un huésped con ese DNI',
  GUEST_NAME_INVALID: 'El nombre solo puede contener letras y espacios',
  GUEST_DNI_INVALID: 'El DNI debe contener exactamente 8 dígitos numéricos',
  GUEST_PHONE_INVALID: 'El teléfono debe contener 9 dígitos y empezar con 9',
  GUEST_EMAIL_INVALID: 'El email no tiene un formato válido',

  // Habitaciones
  ROOM_NOT_FOUND: 'Habitación no encontrada',
  ROOM_NUMBER_EXISTS: 'Ya existe una habitación con ese número',
  ROOM_OCCUPIED: 'La habitación está ocupada y no puede ser modificada',
  ROOM_NOT_AVAILABLE: 'La habitación no está disponible para reservación',

  // Reservaciones
  RESERVATION_NOT_FOUND: 'Reservación no encontrada',
  RESERVATION_INVALID_DATES: 'La fecha de check-out debe ser posterior a la fecha de check-in',
  RESERVATION_PAST_CHECKIN: 'La fecha de check-in no puede ser anterior a hoy',
  RESERVATION_EXCEEDS_CAPACITY: (type, max) => `La habitación tipo '${type}' permite máximo ${max} huésped(es)`,
  RESERVATION_ALREADY_CANCELLED: 'La reservación ya fue cancelada',
  RESERVATION_ALREADY_COMPLETED: 'La reservación ya fue completada',
  RESERVATION_MAX_NIGHTS: (max) => `La estadía no puede exceder ${max} noches`,

  // Facturación
  BILLING_NOT_FOUND: 'Factura no encontrada',
  BILLING_ALREADY_PAID: 'La factura ya fue pagada',
  BILLING_ALREADY_CANCELLED: 'La factura ya fue anulada',
  BILLING_RESERVATION_REQUIRED: 'Se requiere una reservación válida para generar la factura',

  // Servidor
  INTERNAL_ERROR: 'Error interno del servidor. Por favor, intente de nuevo.',
  INVALID_JSON: 'El cuerpo de la solicitud no es un JSON válido',
  ROUTE_NOT_FOUND: 'La ruta solicitada no existe',
};

module.exports = {
  GUEST_RULES,
  ROOM_RULES,
  RESERVATION_RULES,
  BILLING_RULES,
  ERROR_MESSAGES,
};
