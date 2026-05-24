// ============================================================================
// CONTROLADOR DE RESERVACIONES
// ============================================================================

const reservationService = require('../services/reservationService');

async function getAll(req, res, next) {
  try {
    const filters = {
      estado: req.query.estado,
      huespedId: req.query.huespedId,
    };
    const reservations = reservationService.getAllReservations(filters);
    res.json({ success: true, data: reservations, count: reservations.length });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const reservation = reservationService.getReservationById(req.params.id);
    res.json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const reservation = reservationService.createReservation(req.body);
    res.status(201).json({ success: true, data: reservation, message: 'Reservación creada exitosamente' });
  } catch (error) {
    next(error);
  }
}

async function cancel(req, res, next) {
  try {
    const reservation = reservationService.cancelReservation(req.params.id);
    res.json({ success: true, data: reservation, message: 'Reservación cancelada exitosamente' });
  } catch (error) {
    next(error);
  }
}

async function complete(req, res, next) {
  try {
    const reservation = reservationService.completeReservation(req.params.id);
    res.json({ success: true, data: reservation, message: 'Check-out realizado exitosamente' });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, getById, create, cancel, complete };
