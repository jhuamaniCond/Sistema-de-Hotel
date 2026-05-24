// ============================================================================
// SERVICIO DE HABITACIONES
// Lógica de negocio para gestión de habitaciones
// ============================================================================

const { store, generateId } = require('../data/store');
const { NotFoundError, ConflictError, BusinessError } = require('../middleware/errorHandler');
const { ERROR_MESSAGES, ROOM_RULES } = require('../config/constants');

/**
 * Obtener todas las habitaciones
 * @param {Object} filters - Filtros opcionales (tipo, estado, piso)
 * @returns {Array} Lista de habitaciones
 */
function getAllRooms(filters = {}) {
  let rooms = Array.from(store.rooms.values());

  if (filters.tipo) {
    const tipo = filters.tipo.trim().toLowerCase();
    if (ROOM_RULES.VALID_TYPES.includes(tipo)) {
      rooms = rooms.filter(r => r.type === tipo);
    }
  }

  if (filters.estado) {
    const estado = filters.estado.trim().toLowerCase();
    if (ROOM_RULES.VALID_STATUSES.includes(estado)) {
      rooms = rooms.filter(r => r.status === estado);
    }
  }

  if (filters.piso) {
    const piso = Number(filters.piso);
    if (!isNaN(piso) && Number.isInteger(piso)) {
      rooms = rooms.filter(r => r.floor === piso);
    }
  }

  return rooms;
}

/**
 * Obtener habitación por ID
 * @param {string} id - ID de la habitación
 * @returns {Object} Habitación encontrada
 */
function getRoomById(id) {
  const room = store.rooms.get(id);
  if (!room) {
    throw new NotFoundError(ERROR_MESSAGES.ROOM_NOT_FOUND);
  }
  return room;
}

/**
 * Crear una nueva habitación
 * @param {Object} data - Datos de la habitación validados
 * @returns {Object} Habitación creada
 */
function createRoom(data) {
  const numero = Number(data.numero);

  // Verificar unicidad del número
  if (store.roomsByNumber.has(numero)) {
    throw new ConflictError(ERROR_MESSAGES.ROOM_NUMBER_EXISTS);
  }

  const id = generateId();
  const room = {
    id,
    number: numero,
    type: data.tipo.trim().toLowerCase(),
    price: Math.round(Number(data.precio) * 100) / 100, // Redondear a 2 decimales
    floor: Number(data.piso),
    status: 'disponible',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.rooms.set(id, room);
  store.roomsByNumber.set(numero, id);

  return room;
}

/**
 * Actualizar una habitación existente
 * @param {string} id - ID de la habitación
 * @param {Object} data - Datos parciales a actualizar
 * @returns {Object} Habitación actualizada
 */
function updateRoom(id, data) {
  const room = store.rooms.get(id);
  if (!room) {
    throw new NotFoundError(ERROR_MESSAGES.ROOM_NOT_FOUND);
  }

  // No permitir cambios si está ocupada (excepto estado)
  if (room.status === 'ocupada') {
    const onlyStatusChange = Object.keys(data).length === 1 && data.estado !== undefined;
    if (!onlyStatusChange) {
      throw new BusinessError(ERROR_MESSAGES.ROOM_OCCUPIED);
    }
  }

  // Si cambia el número, verificar unicidad
  if (data.numero !== undefined) {
    const newNumber = Number(data.numero);
    if (newNumber !== room.number) {
      if (store.roomsByNumber.has(newNumber)) {
        throw new ConflictError(ERROR_MESSAGES.ROOM_NUMBER_EXISTS);
      }
      store.roomsByNumber.delete(room.number);
      store.roomsByNumber.set(newNumber, id);
      room.number = newNumber;
    }
  }

  if (data.tipo !== undefined) room.type = data.tipo.trim().toLowerCase();
  if (data.precio !== undefined) room.price = Math.round(Number(data.precio) * 100) / 100;
  if (data.piso !== undefined) room.floor = Number(data.piso);
  if (data.estado !== undefined) room.status = data.estado.trim().toLowerCase();
  room.updatedAt = new Date().toISOString();

  store.rooms.set(id, room);
  return room;
}

/**
 * Eliminar una habitación
 * @param {string} id - ID de la habitación
 * @returns {Object} Habitación eliminada
 */
function deleteRoom(id) {
  const room = store.rooms.get(id);
  if (!room) {
    throw new NotFoundError(ERROR_MESSAGES.ROOM_NOT_FOUND);
  }

  if (room.status === 'ocupada') {
    throw new BusinessError('No se puede eliminar una habitación ocupada');
  }

  // Verificar que no tenga reservaciones activas
  const hasActiveReservations = Array.from(store.reservations.values()).some(
    (r) => r.habitacionId === id && (r.estado === 'confirmada' || r.estado === 'pendiente')
  );

  if (hasActiveReservations) {
    throw new ConflictError('No se puede eliminar una habitación con reservaciones activas');
  }

  store.roomsByNumber.delete(room.number);
  store.rooms.delete(id);
  return room;
}

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
};
