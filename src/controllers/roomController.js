// ============================================================================
// CONTROLADOR DE HABITACIONES
// ============================================================================

const roomService = require('../services/roomService');

async function getAll(req, res, next) {
  try {
    const filters = {
      tipo: req.query.tipo,
      estado: req.query.estado,
      piso: req.query.piso,
    };
    const rooms = roomService.getAllRooms(filters);
    res.json({ success: true, data: rooms, count: rooms.length });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const room = roomService.getRoomById(req.params.id);
    res.json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const room = roomService.createRoom(req.body);
    res.status(201).json({ success: true, data: room, message: 'Habitación creada exitosamente' });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const room = roomService.updateRoom(req.params.id, req.body);
    res.json({ success: true, data: room, message: 'Habitación actualizada exitosamente' });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const room = roomService.deleteRoom(req.params.id);
    res.json({ success: true, data: room, message: 'Habitación eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, getById, create, update, remove };
