// ============================================================================
// TESTS DE RESERVACIONES
// Cobertura: PE y AVL para fechas, capacidad y reglas de negocio
// ============================================================================

const request = require('supertest');
const app = require('../src/app');
const { resetStore, seedData, store } = require('../src/data/store');

let guestId, roomId;

beforeEach(async () => {
  resetStore();
  seedData();

  // Crear un huésped de prueba
  const guestRes = await request(app).post('/api/huespedes').send({
    nombre: 'Huésped Test', dni: '11111111', edad: 30, telefono: '912345678', email: 'test@test.com'
  });
  guestId = guestRes.body.data.id;

  // Obtener una habitación disponible
  const roomsRes = await request(app).get('/api/habitaciones?estado=disponible');
  roomId = roomsRes.body.data[0].id;
});

function getFutureDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

describe('Módulo de Reservaciones', () => {

  describe('POST /api/reservaciones - Crear reservación', () => {

    // --- CLASE VÁLIDA ---
    test('PE-V1: Debe crear reservación con datos válidos', async () => {
      const res = await request(app).post('/api/reservaciones').send({
        huespedId: guestId,
        habitacionId: roomId,
        fechaCheckIn: getFutureDate(1),
        fechaCheckOut: getFutureDate(3),
        numHuespedes: 1,
      });
      expect(res.status).toBe(201);
      expect(res.body.data.noches).toBe(2);
      expect(res.body.data.estado).toBe('confirmada');
    });

    // =================================================================
    // FECHAS - Partición de Equivalencia
    // =================================================================
    test('PE-I-FECHA1: Debe rechazar check-in en el pasado', async () => {
      const res = await request(app).post('/api/reservaciones').send({
        huespedId: guestId, habitacionId: roomId,
        fechaCheckIn: '2020-01-01', fechaCheckOut: '2020-01-05', numHuespedes: 1,
      });
      expect(res.status).toBe(400);
    });

    test('PE-I-FECHA2: Debe rechazar check-out igual a check-in', async () => {
      const date = getFutureDate(1);
      const res = await request(app).post('/api/reservaciones').send({
        huespedId: guestId, habitacionId: roomId,
        fechaCheckIn: date, fechaCheckOut: date, numHuespedes: 1,
      });
      expect(res.status).toBe(400);
    });

    test('PE-I-FECHA3: Debe rechazar check-out antes de check-in', async () => {
      const res = await request(app).post('/api/reservaciones').send({
        huespedId: guestId, habitacionId: roomId,
        fechaCheckIn: getFutureDate(5), fechaCheckOut: getFutureDate(2), numHuespedes: 1,
      });
      expect(res.status).toBe(400);
    });

    test('PE-I-FECHA4: Debe rechazar formato de fecha inválido', async () => {
      const res = await request(app).post('/api/reservaciones').send({
        huespedId: guestId, habitacionId: roomId,
        fechaCheckIn: '01/01/2027', fechaCheckOut: '05/01/2027', numHuespedes: 1,
      });
      expect(res.status).toBe(400);
    });

    test('PE-I-FECHA5: Debe rechazar fecha inexistente (31 de febrero)', async () => {
      const res = await request(app).post('/api/reservaciones').send({
        huespedId: guestId, habitacionId: roomId,
        fechaCheckIn: '2027-02-31', fechaCheckOut: '2027-03-05', numHuespedes: 1,
      });
      expect(res.status).toBe(400);
    });

    // AVL Fechas - Noches máximas
    test('AVL-FECHA1: Debe aceptar estadía de 1 noche (mínimo)', async () => {
      const res = await request(app).post('/api/reservaciones').send({
        huespedId: guestId, habitacionId: roomId,
        fechaCheckIn: getFutureDate(1), fechaCheckOut: getFutureDate(2), numHuespedes: 1,
      });
      expect(res.status).toBe(201);
      expect(res.body.data.noches).toBe(1);
    });

    test('AVL-FECHA2: Debe rechazar estadía mayor a 365 noches', async () => {
      const res = await request(app).post('/api/reservaciones').send({
        huespedId: guestId, habitacionId: roomId,
        fechaCheckIn: getFutureDate(1), fechaCheckOut: getFutureDate(367), numHuespedes: 1,
      });
      expect(res.status).toBe(400);
    });

    // =================================================================
    // NÚMERO DE HUÉSPEDES - PE y AVL
    // =================================================================
    test('PE-I-HUE1: Debe rechazar 0 huéspedes', async () => {
      const res = await request(app).post('/api/reservaciones').send({
        huespedId: guestId, habitacionId: roomId,
        fechaCheckIn: getFutureDate(10), fechaCheckOut: getFutureDate(12), numHuespedes: 0,
      });
      expect(res.status).toBe(400);
    });

    test('PE-I-HUE2: Debe rechazar huéspedes negativos', async () => {
      const res = await request(app).post('/api/reservaciones').send({
        huespedId: guestId, habitacionId: roomId,
        fechaCheckIn: getFutureDate(10), fechaCheckOut: getFutureDate(12), numHuespedes: -1,
      });
      expect(res.status).toBe(400);
    });

    test('PE-I-HUE3: Debe rechazar 5 huéspedes (límite superior + 1)', async () => {
      const res = await request(app).post('/api/reservaciones').send({
        huespedId: guestId, habitacionId: roomId,
        fechaCheckIn: getFutureDate(10), fechaCheckOut: getFutureDate(12), numHuespedes: 5,
      });
      expect(res.status).toBe(400);
    });

    test('PE-I-HUE4: Debe rechazar huéspedes decimales', async () => {
      const res = await request(app).post('/api/reservaciones').send({
        huespedId: guestId, habitacionId: roomId,
        fechaCheckIn: getFutureDate(10), fechaCheckOut: getFutureDate(12), numHuespedes: 1.5,
      });
      expect(res.status).toBe(400);
    });

    // =================================================================
    // REGLAS DE NEGOCIO
    // =================================================================
    test('PE-I-NEG1: Debe rechazar huésped inexistente', async () => {
      const res = await request(app).post('/api/reservaciones').send({
        huespedId: '00000000-0000-4000-8000-000000000000', habitacionId: roomId,
        fechaCheckIn: getFutureDate(1), fechaCheckOut: getFutureDate(3), numHuespedes: 1,
      });
      expect(res.status).toBe(404);
    });

    test('PE-I-NEG2: Debe rechazar habitación inexistente', async () => {
      const res = await request(app).post('/api/reservaciones').send({
        huespedId: guestId, habitacionId: '00000000-0000-4000-8000-000000000000',
        fechaCheckIn: getFutureDate(1), fechaCheckOut: getFutureDate(3), numHuespedes: 1,
      });
      expect(res.status).toBe(404);
    });

    test('PE-I-NEG3: Debe rechazar habitación en mantenimiento', async () => {
      // Buscar la habitación en mantenimiento (302 del seed)
      const roomsRes = await request(app).get('/api/habitaciones?estado=mantenimiento');
      if (roomsRes.body.data.length > 0) {
        const maintRoom = roomsRes.body.data[0].id;
        const res = await request(app).post('/api/reservaciones').send({
          huespedId: guestId, habitacionId: maintRoom,
          fechaCheckIn: getFutureDate(1), fechaCheckOut: getFutureDate(3), numHuespedes: 1,
        });
        expect(res.status).toBe(422);
      }
    });

    test('PE-I-NEG4: Debe rechazar campos faltantes', async () => {
      const res = await request(app).post('/api/reservaciones').send({
        huespedId: guestId,
      });
      expect(res.status).toBe(400);
    });
  });

  // ========================================================================
  // TESTS DE CANCELACIÓN
  // ========================================================================
  describe('PATCH /api/reservaciones/:id/cancelar', () => {
    test('Debe cancelar reservación confirmada', async () => {
      const createRes = await request(app).post('/api/reservaciones').send({
        huespedId: guestId, habitacionId: roomId,
        fechaCheckIn: getFutureDate(1), fechaCheckOut: getFutureDate(3), numHuespedes: 1,
      });
      const res = await request(app).patch(`/api/reservaciones/${createRes.body.data.id}/cancelar`);
      expect(res.status).toBe(200);
      expect(res.body.data.estado).toBe('cancelada');
    });

    test('Debe rechazar cancelar reservación ya cancelada', async () => {
      const createRes = await request(app).post('/api/reservaciones').send({
        huespedId: guestId, habitacionId: roomId,
        fechaCheckIn: getFutureDate(1), fechaCheckOut: getFutureDate(3), numHuespedes: 1,
      });
      const id = createRes.body.data.id;
      await request(app).patch(`/api/reservaciones/${id}/cancelar`);
      const res = await request(app).patch(`/api/reservaciones/${id}/cancelar`);
      expect(res.status).toBe(422);
    });
  });

  // ========================================================================
  // TESTS DE CHECK-OUT
  // ========================================================================
  describe('PATCH /api/reservaciones/:id/completar', () => {
    test('Debe completar reservación y liberar habitación', async () => {
      const createRes = await request(app).post('/api/reservaciones').send({
        huespedId: guestId, habitacionId: roomId,
        fechaCheckIn: getFutureDate(1), fechaCheckOut: getFutureDate(3), numHuespedes: 1,
      });
      const res = await request(app).patch(`/api/reservaciones/${createRes.body.data.id}/completar`);
      expect(res.status).toBe(200);
      expect(res.body.data.estado).toBe('completada');

      // Verificar que la habitación se liberó
      const roomRes = await request(app).get(`/api/habitaciones/${roomId}`);
      expect(roomRes.body.data.status).toBe('disponible');
    });
  });
});
