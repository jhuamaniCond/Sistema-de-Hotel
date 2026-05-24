// ============================================================================
// RUTAS DE FACTURACIÓN
// ============================================================================

const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { validateRequest, validateIdParam } = require('../middleware/validateRequest');
const { validateBilling } = require('../validators/billingValidator');

// GET /api/facturacion - Listar todas
router.get('/', billingController.getAll);

// GET /api/facturacion/:id - Obtener por ID
router.get('/:id', validateIdParam(), billingController.getById);

// POST /api/facturacion - Crear nueva
router.post('/', validateRequest(validateBilling), billingController.create);

// PATCH /api/facturacion/:id/pagar - Pagar
router.patch('/:id/pagar', validateIdParam(), billingController.pay);

// PATCH /api/facturacion/:id/anular - Anular
router.patch('/:id/anular', validateIdParam(), billingController.cancel);

module.exports = router;
