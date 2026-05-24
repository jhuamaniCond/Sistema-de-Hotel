// ============================================================================
// TESTS DE FACTURACIÓN
// Cobertura: PE y AVL para métodos de pago, descuentos y estados
// ============================================================================

const request = require('supertest');
const app = require('../src/app');
const { resetStore, seedData } = require('../src/data/store');

function getFutureDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

describe('Módulo de Facturación', () => {
  const ctx = {};

  beforeEach(async () => {
    resetStore();
    seedData();

    // Crear datos de prueba: huésped → reservación
    const guestRes = await request(app).post('/api/huespedes').send({
      nombre: 'Factura Test', dni: '22222222', edad: 35, telefono: '923456789', email: 'factura@test.com'
    });
    ctx.guestId = guestRes.body.data.id;

    const roomsRes = await request(app).get('/api/habitaciones?estado=disponible');
    ctx.roomId = roomsRes.body.data[0].id;

    const resRes = await request(app).post('/api/reservaciones').send({
      huespedId: ctx.guestId, habitacionId: ctx.roomId,
      fechaCheckIn: getFutureDate(1), fechaCheckOut: getFutureDate(4), numHuespedes: 1,
    });
    ctx.reservationId = resRes.body.data.id;
  });

  describe('POST /api/facturacion - Crear factura', () => {

    // --- CLASE VÁLIDA ---
    test('PE-V1: Debe crear factura con datos válidos', async () => {
      const res = await request(app).post('/api/facturacion').send({
        reservacionId: ctx.reservationId, metodoPago: 'efectivo', descuento: 0,
      });
      expect(res.status).toBe(201);
      expect(res.body.data.estado).toBe('pendiente');
      expect(res.body.data.igv).toBeGreaterThan(0);
      expect(res.body.data.totalConIgv).toBeGreaterThan(0);
    });

    // =================================================================
    // MÉTODO DE PAGO - Partición de Equivalencia
    // =================================================================
    test('PE-V-PAGO1: Debe aceptar "efectivo"', async () => {
      const res = await request(app).post('/api/facturacion').send({
        reservacionId: ctx.reservationId, metodoPago: 'efectivo',
      });
      expect(res.status).toBe(201);
    });

    test('PE-V-PAGO2: Debe aceptar "tarjeta"', async () => {
      const guestRes2 = await request(app).post('/api/huespedes').send({
        nombre: 'Otro Test', dni: '33333333', edad: 28, telefono: '934567890', email: 'otro@test.com'
      });
      const rooms = await request(app).get('/api/habitaciones?estado=disponible');
      if (rooms.body.data.length > 0) {
        const resRes2 = await request(app).post('/api/reservaciones').send({
          huespedId: guestRes2.body.data.id, habitacionId: rooms.body.data[0].id,
          fechaCheckIn: getFutureDate(1), fechaCheckOut: getFutureDate(3), numHuespedes: 1,
        });
        const res = await request(app).post('/api/facturacion').send({
          reservacionId: resRes2.body.data.id, metodoPago: 'tarjeta',
        });
        expect(res.status).toBe(201);
      }
    });

    test('PE-V-PAGO3: Debe aceptar "transferencia"', async () => {
      const guestRes3 = await request(app).post('/api/huespedes').send({
        nombre: 'Transfer Test', dni: '44444444', edad: 40, telefono: '945678901', email: 'transfer@test.com'
      });
      const rooms = await request(app).get('/api/habitaciones?estado=disponible');
      if (rooms.body.data.length > 0) {
        const resRes3 = await request(app).post('/api/reservaciones').send({
          huespedId: guestRes3.body.data.id, habitacionId: rooms.body.data[0].id,
          fechaCheckIn: getFutureDate(1), fechaCheckOut: getFutureDate(3), numHuespedes: 1,
        });
        const res = await request(app).post('/api/facturacion').send({
          reservacionId: resRes3.body.data.id, metodoPago: 'transferencia',
        });
        expect(res.status).toBe(201);
      }
    });

    test('PE-I-PAGO1: Debe rechazar método "bitcoin"', async () => {
      const res = await request(app).post('/api/facturacion').send({
        reservacionId: ctx.reservationId, metodoPago: 'bitcoin',
      });
      expect(res.status).toBe(400);
    });

    test('PE-I-PAGO2: Debe rechazar método vacío', async () => {
      const res = await request(app).post('/api/facturacion').send({
        reservacionId: ctx.reservationId, metodoPago: '',
      });
      expect(res.status).toBe(400);
    });

    test('PE-I-PAGO3: Debe rechazar método numérico', async () => {
      const res = await request(app).post('/api/facturacion').send({
        reservacionId: ctx.reservationId, metodoPago: 123,
      });
      expect(res.status).toBe(400);
    });

    // =================================================================
    // DESCUENTO - Valores Límite
    // =================================================================
    test('AVL-DESC1: Debe rechazar descuento -1 (límite inferior - 1)', async () => {
      const res = await request(app).post('/api/facturacion').send({
        reservacionId: ctx.reservationId, metodoPago: 'efectivo', descuento: -1,
      });
      expect(res.status).toBe(400);
    });

    test('AVL-DESC2: Debe aceptar descuento 0 (límite inferior)', async () => {
      const res = await request(app).post('/api/facturacion').send({
        reservacionId: ctx.reservationId, metodoPago: 'efectivo', descuento: 0,
      });
      expect(res.status).toBe(201);
    });

    test('AVL-DESC3: Debe aceptar descuento 1 (límite inferior + 1)', async () => {
      const res = await request(app).post('/api/facturacion').send({
        reservacionId: ctx.reservationId, metodoPago: 'efectivo', descuento: 1,
      });
      expect(res.status).toBe(201);
    });

    test('AVL-DESC4: Debe aceptar descuento 49 (límite superior - 1)', async () => {
      const billings = await request(app).get('/api/facturacion');
      for (const b of billings.body.data) {
        if (b.reservacionId === ctx.reservationId && b.estado === 'pendiente') {
          await request(app).patch(`/api/facturacion/${b.id}/anular`);
        }
      }
      const res = await request(app).post('/api/facturacion').send({
        reservacionId: ctx.reservationId, metodoPago: 'efectivo', descuento: 49,
      });
      expect(res.status).toBe(201);
    });

    test('AVL-DESC5: Debe aceptar descuento 50 (límite superior)', async () => {
      const billings = await request(app).get('/api/facturacion');
      for (const b of billings.body.data) {
        if (b.reservacionId === ctx.reservationId && b.estado === 'pendiente') {
          await request(app).patch(`/api/facturacion/${b.id}/anular`);
        }
      }
      const res = await request(app).post('/api/facturacion').send({
        reservacionId: ctx.reservationId, metodoPago: 'efectivo', descuento: 50,
      });
      expect(res.status).toBe(201);
    });

    test('AVL-DESC6: Debe rechazar descuento 51 (límite superior + 1)', async () => {
      const res = await request(app).post('/api/facturacion').send({
        reservacionId: ctx.reservationId, metodoPago: 'efectivo', descuento: 51,
      });
      expect(res.status).toBe(400);
    });

    test('PE-I-DESC1: Debe rechazar descuento 100', async () => {
      const res = await request(app).post('/api/facturacion').send({
        reservacionId: ctx.reservationId, metodoPago: 'efectivo', descuento: 100,
      });
      expect(res.status).toBe(400);
    });

    // =================================================================
    // REGLAS DE NEGOCIO
    // =================================================================
    test('PE-I-NEG1: Debe rechazar reservación inexistente', async () => {
      const res = await request(app).post('/api/facturacion').send({
        reservacionId: '00000000-0000-4000-8000-000000000000', metodoPago: 'efectivo',
      });
      expect(res.status).toBe(404);
    });

    test('PE-I-NEG2: Debe rechazar factura duplicada', async () => {
      await request(app).post('/api/facturacion').send({
        reservacionId: ctx.reservationId, metodoPago: 'efectivo',
      });
      const res = await request(app).post('/api/facturacion').send({
        reservacionId: ctx.reservationId, metodoPago: 'tarjeta',
      });
      expect(res.status).toBe(409);
    });
  });

  // ========================================================================
  // TESTS DE PAGO
  // ========================================================================
  describe('PATCH /api/facturacion/:id/pagar', () => {
    test('Debe pagar factura pendiente', async () => {
      const createRes = await request(app).post('/api/facturacion').send({
        reservacionId: ctx.reservationId, metodoPago: 'efectivo',
      });
      const res = await request(app).patch(`/api/facturacion/${createRes.body.data.id}/pagar`);
      expect(res.status).toBe(200);
      expect(res.body.data.estado).toBe('pagada');
    });

    test('Debe rechazar pagar factura ya pagada', async () => {
      const createRes = await request(app).post('/api/facturacion').send({
        reservacionId: ctx.reservationId, metodoPago: 'efectivo',
      });
      const id = createRes.body.data.id;
      await request(app).patch(`/api/facturacion/${id}/pagar`);
      const res = await request(app).patch(`/api/facturacion/${id}/pagar`);
      expect(res.status).toBe(422);
    });
  });

  // ========================================================================
  // TESTS DE ANULACIÓN
  // ========================================================================
  describe('PATCH /api/facturacion/:id/anular', () => {
    test('Debe anular factura pendiente', async () => {
      const createRes = await request(app).post('/api/facturacion').send({
        reservacionId: ctx.reservationId, metodoPago: 'efectivo',
      });
      const res = await request(app).patch(`/api/facturacion/${createRes.body.data.id}/anular`);
      expect(res.status).toBe(200);
      expect(res.body.data.estado).toBe('anulada');
    });

    test('Debe rechazar anular factura ya pagada', async () => {
      const createRes = await request(app).post('/api/facturacion').send({
        reservacionId: ctx.reservationId, metodoPago: 'efectivo',
      });
      const id = createRes.body.data.id;
      await request(app).patch(`/api/facturacion/${id}/pagar`);
      const res = await request(app).patch(`/api/facturacion/${id}/anular`);
      expect(res.status).toBe(422);
    });
  });
});
