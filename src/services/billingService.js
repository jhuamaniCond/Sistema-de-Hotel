// ============================================================================
// SERVICIO DE FACTURACIÓN
// Lógica de negocio para gestión de facturas con cálculos de IGV y descuentos
// ============================================================================

const { store, generateId } = require('../data/store');
const { NotFoundError, ConflictError, BusinessError } = require('../middleware/errorHandler');
const { ERROR_MESSAGES, BILLING_RULES } = require('../config/constants');

/**
 * Obtener todas las facturas
 * @param {Object} filters - Filtros opcionales
 * @returns {Array} Lista de facturas
 */
function getAllBillings(filters = {}) {
  let billings = Array.from(store.billings.values());

  if (filters.estado) {
    const estado = filters.estado.trim().toLowerCase();
    if (BILLING_RULES.VALID_STATUSES.includes(estado)) {
      billings = billings.filter(b => b.estado === estado);
    }
  }

  if (filters.reservacionId) {
    billings = billings.filter(b => b.reservacionId === filters.reservacionId);
  }

  return billings;
}

/**
 * Obtener factura por ID
 * @param {string} id - ID de la factura
 * @returns {Object} Factura encontrada
 */
function getBillingById(id) {
  const billing = store.billings.get(id);
  if (!billing) {
    throw new NotFoundError(ERROR_MESSAGES.BILLING_NOT_FOUND);
  }
  return billing;
}

/**
 * Crear una nueva factura
 * @param {Object} data - Datos de la factura validados
 * @returns {Object} Factura creada
 */
function createBilling(data) {
  // Verificar que la reservación existe
  const reservation = store.reservations.get(data.reservacionId);
  if (!reservation) {
    throw new NotFoundError(ERROR_MESSAGES.RESERVATION_NOT_FOUND);
  }

  // Verificar que la reservación está confirmada o completada
  if (reservation.estado === 'cancelada') {
    throw new BusinessError('No se puede facturar una reservación cancelada');
  }

  // Verificar que no exista ya una factura activa para esta reservación
  const existingBilling = Array.from(store.billings.values()).find(
    (b) => b.reservacionId === data.reservacionId && b.estado !== 'anulada'
  );

  if (existingBilling) {
    throw new ConflictError('Ya existe una factura activa para esta reservación');
  }

  // Calcular montos
  const subtotal = reservation.total;
  const descuentoAdicional = data.descuento !== undefined ? Number(data.descuento) : 0;
  const montoDescuentoAdicional = Math.round((subtotal * descuentoAdicional / 100) * 100) / 100;
  const baseImponible = Math.round((subtotal - montoDescuentoAdicional) * 100) / 100;
  const igv = Math.round((baseImponible * BILLING_RULES.TAX_RATE / 100) * 100) / 100;
  const totalConIgv = Math.round((baseImponible + igv) * 100) / 100;

  const id = generateId();
  const billing = {
    id,
    reservacionId: data.reservacionId,
    numeroReservacion: reservation.id.substring(0, 8).toUpperCase(),
    nombreHuesped: reservation.nombreHuesped,
    numeroHabitacion: reservation.numeroHabitacion,
    tipoHabitacion: reservation.tipoHabitacion,
    fechaCheckIn: reservation.fechaCheckIn,
    fechaCheckOut: reservation.fechaCheckOut,
    noches: reservation.noches,
    precioPorNoche: reservation.precioPorNoche,
    subtotalHabitacion: reservation.subtotal,
    descuentoEstadia: reservation.descuentoEstadia,
    montoDescuentoEstadia: reservation.montoDescuento,
    subtotalConDescuentoEstadia: reservation.total,
    descuentoAdicional,
    montoDescuentoAdicional,
    baseImponible,
    igv,
    tasaIgv: BILLING_RULES.TAX_RATE,
    totalConIgv,
    metodoPago: data.metodoPago.trim().toLowerCase(),
    estado: 'pendiente',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.billings.set(id, billing);
  return billing;
}

/**
 * Pagar una factura
 * @param {string} id - ID de la factura
 * @returns {Object} Factura pagada
 */
function payBilling(id) {
  const billing = store.billings.get(id);
  if (!billing) {
    throw new NotFoundError(ERROR_MESSAGES.BILLING_NOT_FOUND);
  }

  if (billing.estado === 'pagada') {
    throw new BusinessError(ERROR_MESSAGES.BILLING_ALREADY_PAID);
  }

  if (billing.estado === 'anulada') {
    throw new BusinessError(ERROR_MESSAGES.BILLING_ALREADY_CANCELLED);
  }

  billing.estado = 'pagada';
  billing.fechaPago = new Date().toISOString();
  billing.updatedAt = new Date().toISOString();

  store.billings.set(id, billing);
  return billing;
}

/**
 * Anular una factura
 * @param {string} id - ID de la factura
 * @returns {Object} Factura anulada
 */
function cancelBilling(id) {
  const billing = store.billings.get(id);
  if (!billing) {
    throw new NotFoundError(ERROR_MESSAGES.BILLING_NOT_FOUND);
  }

  if (billing.estado === 'anulada') {
    throw new BusinessError(ERROR_MESSAGES.BILLING_ALREADY_CANCELLED);
  }

  if (billing.estado === 'pagada') {
    throw new BusinessError('No se puede anular una factura que ya fue pagada');
  }

  billing.estado = 'anulada';
  billing.updatedAt = new Date().toISOString();

  store.billings.set(id, billing);
  return billing;
}

module.exports = {
  getAllBillings,
  getBillingById,
  createBilling,
  payBilling,
  cancelBilling,
};
