// ============================================================================
// RUTAS DE RESERVACIONES
// ============================================================================

const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { validateRequest, validateIdParam } = require('../middleware/validateRequest');
const { validateReservation } = require('../validators/reservationValidator');

// GET /api/reservaciones - Listar todas
router.get('/', reservationController.getAll);

// GET /api/reservaciones/:id - Obtener por ID
router.get('/:id', validateIdParam(), reservationController.getById);

// POST /api/reservaciones - Crear nueva
router.post('/', validateRequest(validateReservation), reservationController.create);

// PATCH /api/reservaciones/:id/cancelar - Cancelar
router.patch('/:id/cancelar', validateIdParam(), reservationController.cancel);

// PATCH /api/reservaciones/:id/completar - Completar (check-out)
router.patch('/:id/completar', validateIdParam(), reservationController.complete);

module.exports = router;
