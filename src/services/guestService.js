// ============================================================================
// SERVICIO DE HUÉSPEDES
// Lógica de negocio para gestión de huéspedes
// ============================================================================

const { store, generateId } = require('../data/store');
const { NotFoundError, ConflictError } = require('../middleware/errorHandler');
const { ERROR_MESSAGES } = require('../config/constants');
const { sanitizeString } = require('../validators/guestValidator');

/**
 * Obtener todos los huéspedes
 * @returns {Array} Lista de huéspedes
 */
function getAllGuests() {
  return Array.from(store.guests.values());
}

/**
 * Obtener un huésped por ID
 * @param {string} id - ID del huésped
 * @returns {Object} Huésped encontrado
 */
function getGuestById(id) {
  const guest = store.guests.get(id);
  if (!guest) {
    throw new NotFoundError(ERROR_MESSAGES.GUEST_NOT_FOUND);
  }
  return guest;
}

/**
 * Buscar huésped por DNI
 * @param {string} dni - DNI del huésped
 * @returns {Object|null} Huésped encontrado o null
 */
function getGuestByDni(dni) {
  const guestId = store.guestsByDni.get(dni);
  if (!guestId) return null;
  return store.guests.get(guestId) || null;
}

/**
 * Crear un nuevo huésped
 * @param {Object} data - Datos del huésped validados
 * @returns {Object} Huésped creado
 */
function createGuest(data) {
  const dni = String(data.dni).trim();

  // Verificar unicidad de DNI
  if (store.guestsByDni.has(dni)) {
    throw new ConflictError(ERROR_MESSAGES.GUEST_DNI_EXISTS);
  }

  const id = generateId();
  const guest = {
    id,
    nombre: sanitizeString(data.nombre),
    dni,
    edad: Number(data.edad),
    telefono: String(data.telefono).trim(),
    email: data.email.trim().toLowerCase(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.guests.set(id, guest);
  store.guestsByDni.set(dni, id);

  return guest;
}

/**
 * Actualizar un huésped existente
 * @param {string} id - ID del huésped
 * @param {Object} data - Datos parciales a actualizar
 * @returns {Object} Huésped actualizado
 */
function updateGuest(id, data) {
  const guest = store.guests.get(id);
  if (!guest) {
    throw new NotFoundError(ERROR_MESSAGES.GUEST_NOT_FOUND);
  }

  // Si cambia el DNI, verificar unicidad
  if (data.dni !== undefined) {
    const newDni = String(data.dni).trim();
    if (newDni !== guest.dni) {
      if (store.guestsByDni.has(newDni)) {
        throw new ConflictError(ERROR_MESSAGES.GUEST_DNI_EXISTS);
      }
      // Actualizar índice
      store.guestsByDni.delete(guest.dni);
      store.guestsByDni.set(newDni, id);
      guest.dni = newDni;
    }
  }

  if (data.nombre !== undefined) guest.nombre = sanitizeString(data.nombre);
  if (data.edad !== undefined) guest.edad = Number(data.edad);
  if (data.telefono !== undefined) guest.telefono = String(data.telefono).trim();
  if (data.email !== undefined) guest.email = data.email.trim().toLowerCase();
  guest.updatedAt = new Date().toISOString();

  store.guests.set(id, guest);
  return guest;
}

/**
 * Eliminar un huésped
 * @param {string} id - ID del huésped
 * @returns {Object} Huésped eliminado
 */
function deleteGuest(id) {
  const guest = store.guests.get(id);
  if (!guest) {
    throw new NotFoundError(ERROR_MESSAGES.GUEST_NOT_FOUND);
  }

  // Verificar que no tenga reservaciones activas
  const hasActiveReservations = Array.from(store.reservations.values()).some(
    (r) => r.huespedId === id && (r.estado === 'confirmada' || r.estado === 'pendiente')
  );

  if (hasActiveReservations) {
    throw new ConflictError('No se puede eliminar un huésped con reservaciones activas');
  }

  store.guestsByDni.delete(guest.dni);
  store.guests.delete(id);
  return guest;
}

module.exports = {
  getAllGuests,
  getGuestById,
  getGuestByDni,
  createGuest,
  updateGuest,
  deleteGuest,
};
