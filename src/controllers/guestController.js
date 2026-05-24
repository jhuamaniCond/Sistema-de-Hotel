// ============================================================================
// CONTROLADOR DE HUÉSPEDES
// Maneja las solicitudes HTTP y delega al servicio
// ============================================================================

const guestService = require('../services/guestService');

async function getAll(req, res, next) {
  try {
    const guests = guestService.getAllGuests();
    res.json({ success: true, data: guests, count: guests.length });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const guest = guestService.getGuestById(req.params.id);
    res.json({ success: true, data: guest });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const guest = guestService.createGuest(req.body);
    res.status(201).json({ success: true, data: guest, message: 'Huésped registrado exitosamente' });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const guest = guestService.updateGuest(req.params.id, req.body);
    res.json({ success: true, data: guest, message: 'Huésped actualizado exitosamente' });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const guest = guestService.deleteGuest(req.params.id);
    res.json({ success: true, data: guest, message: 'Huésped eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, getById, create, update, remove };
