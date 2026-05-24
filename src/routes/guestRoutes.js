// ============================================================================
// RUTAS DE HUÉSPEDES
// ============================================================================

const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guestController');
const { validateRequest, validateIdParam } = require('../middleware/validateRequest');
const { validateGuest, validateGuestUpdate } = require('../validators/guestValidator');

// GET /api/huespedes - Listar todos
router.get('/', guestController.getAll);

// GET /api/huespedes/:id - Obtener por ID
router.get('/:id', validateIdParam(), guestController.getById);

// POST /api/huespedes - Crear nuevo
router.post('/', validateRequest(validateGuest), guestController.create);

// PUT /api/huespedes/:id - Actualizar
router.put('/:id', validateIdParam(), validateRequest(validateGuestUpdate), guestController.update);

// DELETE /api/huespedes/:id - Eliminar
router.delete('/:id', validateIdParam(), guestController.remove);

module.exports = router;
