// ============================================================================
// SERVICIO DE RESERVACIONES
// Lógica de negocio para gestión de reservaciones con validaciones de dominio
// ============================================================================

const { store, generateId } = require('../data/store');
const { NotFoundError, ConflictError, BusinessError } = require('../middleware/errorHandler');
const { ERROR_MESSAGES, RESERVATION_RULES, ROOM_RULES } = require('../config/constants');
const { daysBetween } = require('../validators/reservationValidator');

/**
 * Obtener todas las reservaciones
 * @param {Object} filters - Filtros opcionales
 * @returns {Array} Lista de reservaciones
 */
function getAllReservations(filters = {}) {
  let reservations = Array.from(store.reservations.values());

  if (filters.estado) {
    const estado = filters.estado.trim().toLowerCase();
    if (RESERVATION_RULES.VALID_STATUSES.includes(estado)) {
      reservations = reservations.filter(r => r.estado === estado);
    }
  }

  if (filters.huespedId) {
    reservations = reservations.filter(r => r.huespedId === filters.huespedId);
  }

  return reservations;
}

/**
 * Obtener reservación por ID
 * @param {string} id - ID de la reservación
 * @returns {Object} Reservación encontrada
 */
function getReservationById(id) {
  const reservation = store.reservations.get(id);
  if (!reservation) {
    throw new NotFoundError(ERROR_MESSAGES.RESERVATION_NOT_FOUND);
  }
  return reservation;
}

/**
 * Calcular el costo total de la reservación
 * @param {number} pricePerNight - Precio por noche
 * @param {number} nights - Número de noches
 * @returns {Object} Desglose de costos
 */
function calculateCost(pricePerNight, nights) {
  let subtotal = pricePerNight * nights;
  let discountPercent = 0;

  // Descuento por estadía prolongada
  if (nights >= RESERVATION_RULES.EXTRA_LONG_STAY_THRESHOLD) {
    discountPercent = RESERVATION_RULES.EXTRA_LONG_STAY_DISCOUNT;
  } else if (nights >= RESERVATION_RULES.LONG_STAY_THRESHOLD) {
    discountPercent = RESERVATION_RULES.LONG_STAY_DISCOUNT;
  }

  const discountAmount = Math.round((subtotal * discountPercent / 100) * 100) / 100;
  const subtotalAfterDiscount = Math.round((subtotal - discountAmount) * 100) / 100;

  return {
    precioPorNoche: pricePerNight,
    noches: nights,
    subtotal: Math.round(subtotal * 100) / 100,
    descuentoEstadia: discountPercent,
    montoDescuento: discountAmount,
    total: subtotalAfterDiscount,
  };
}

/**
 * Crear una nueva reservación
 * @param {Object} data - Datos de la reservación validados
 * @returns {Object} Reservación creada
 */
function createReservation(data) {
  // Verificar que el huésped existe
  const guest = store.guests.get(data.huespedId);
  if (!guest) {
    throw new NotFoundError(ERROR_MESSAGES.GUEST_NOT_FOUND);
  }

  // Verificar que la habitación existe
  const room = store.rooms.get(data.habitacionId);
  if (!room) {
    throw new NotFoundError(ERROR_MESSAGES.ROOM_NOT_FOUND);
  }

  // Verificar que la habitación está disponible
  if (room.status !== 'disponible') {
    throw new BusinessError(ERROR_MESSAGES.ROOM_NOT_AVAILABLE);
  }

  // Verificar capacidad de la habitación según tipo
  const numHuespedes = Number(data.numHuespedes);
  const maxGuests = ROOM_RULES.MAX_GUESTS_BY_TYPE[room.type];
  if (numHuespedes > maxGuests) {
    throw new BusinessError(
      ERROR_MESSAGES.RESERVATION_EXCEEDS_CAPACITY(room.type, maxGuests)
    );
  }

  // Verificar que no haya reservaciones solapadas para esta habitación
  const overlapping = Array.from(store.reservations.values()).some((r) => {
    if (r.habitacionId !== data.habitacionId) return false;
    if (r.estado === 'cancelada' || r.estado === 'completada') return false;

    // Verificar solapamiento de fechas
    return data.fechaCheckIn < r.fechaCheckOut && data.fechaCheckOut > r.fechaCheckIn;
  });

  if (overlapping) {
    throw new ConflictError('La habitación ya tiene una reservación activa en las fechas seleccionadas');
  }

  const nights = daysBetween(data.fechaCheckIn, data.fechaCheckOut);
  const costos = calculateCost(room.price, nights);

  const id = generateId();
  const reservation = {
    id,
    huespedId: data.huespedId,
    habitacionId: data.habitacionId,
    nombreHuesped: guest.nombre,
    numeroHabitacion: room.number,
    tipoHabitacion: room.type,
    fechaCheckIn: data.fechaCheckIn,
    fechaCheckOut: data.fechaCheckOut,
    numHuespedes,
    ...costos,
    estado: 'confirmada',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.reservations.set(id, reservation);

  // Actualizar estado de la habitación
  room.status = 'ocupada';
  room.updatedAt = new Date().toISOString();
  store.rooms.set(data.habitacionId, room);

  return reservation;
}

/**
 * Cancelar una reservación
 * @param {string} id - ID de la reservación
 * @returns {Object} Reservación cancelada
 */
function cancelReservation(id) {
  const reservation = store.reservations.get(id);
  if (!reservation) {
    throw new NotFoundError(ERROR_MESSAGES.RESERVATION_NOT_FOUND);
  }

  if (reservation.estado === 'cancelada') {
    throw new BusinessError(ERROR_MESSAGES.RESERVATION_ALREADY_CANCELLED);
  }

  if (reservation.estado === 'completada') {
    throw new BusinessError(ERROR_MESSAGES.RESERVATION_ALREADY_COMPLETED);
  }

  reservation.estado = 'cancelada';
  reservation.updatedAt = new Date().toISOString();
  store.reservations.set(id, reservation);

  // Liberar la habitación
  const room = store.rooms.get(reservation.habitacionId);
  if (room && room.status === 'ocupada') {
    room.status = 'disponible';
    room.updatedAt = new Date().toISOString();
    store.rooms.set(reservation.habitacionId, room);
  }

  return reservation;
}

/**
 * Completar una reservación (check-out)
 * @param {string} id - ID de la reservación
 * @returns {Object} Reservación completada
 */
function completeReservation(id) {
  const reservation = store.reservations.get(id);
  if (!reservation) {
    throw new NotFoundError(ERROR_MESSAGES.RESERVATION_NOT_FOUND);
  }

  if (reservation.estado === 'cancelada') {
    throw new BusinessError(ERROR_MESSAGES.RESERVATION_ALREADY_CANCELLED);
  }

  if (reservation.estado === 'completada') {
    throw new BusinessError(ERROR_MESSAGES.RESERVATION_ALREADY_COMPLETED);
  }

  reservation.estado = 'completada';
  reservation.updatedAt = new Date().toISOString();
  store.reservations.set(id, reservation);

  // Liberar la habitación
  const room = store.rooms.get(reservation.habitacionId);
  if (room && room.status === 'ocupada') {
    room.status = 'disponible';
    room.updatedAt = new Date().toISOString();
    store.rooms.set(reservation.habitacionId, room);
  }

  return reservation;
}

module.exports = {
  getAllReservations,
  getReservationById,
  createReservation,
  cancelReservation,
  completeReservation,
  calculateCost,
};
