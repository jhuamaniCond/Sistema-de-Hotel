// ============================================================================
// RUTAS DE HABITACIONES
// ============================================================================

const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { validateRequest, validateIdParam } = require('../middleware/validateRequest');
const { validateRoom, validateRoomUpdate } = require('../validators/roomValidator');

// GET /api/habitaciones - Listar todas (con filtros opcionales)
router.get('/', roomController.getAll);

// GET /api/habitaciones/:id - Obtener por ID
router.get('/:id', validateIdParam(), roomController.getById);

// POST /api/habitaciones - Crear nueva
router.post('/', validateRequest(validateRoom), roomController.create);

// PUT /api/habitaciones/:id - Actualizar
router.put('/:id', validateIdParam(), validateRequest(validateRoomUpdate), roomController.update);

// DELETE /api/habitaciones/:id - Eliminar
router.delete('/:id', validateIdParam(), roomController.remove);

module.exports = router;
