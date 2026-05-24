// ============================================================================
// CONTROLADOR DE FACTURACIÓN
// ============================================================================

const billingService = require('../services/billingService');

async function getAll(req, res, next) {
  try {
    const filters = {
      estado: req.query.estado,
      reservacionId: req.query.reservacionId,
    };
    const billings = billingService.getAllBillings(filters);
    res.json({ success: true, data: billings, count: billings.length });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const billing = billingService.getBillingById(req.params.id);
    res.json({ success: true, data: billing });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const billing = billingService.createBilling(req.body);
    res.status(201).json({ success: true, data: billing, message: 'Factura generada exitosamente' });
  } catch (error) {
    next(error);
  }
}

async function pay(req, res, next) {
  try {
    const billing = billingService.payBilling(req.params.id);
    res.json({ success: true, data: billing, message: 'Factura pagada exitosamente' });
  } catch (error) {
    next(error);
  }
}

async function cancel(req, res, next) {
  try {
    const billing = billingService.cancelBilling(req.params.id);
    res.json({ success: true, data: billing, message: 'Factura anulada exitosamente' });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, getById, create, pay, cancel };
