// ============================================================================
// TESTS DE HABITACIONES
// Cobertura: PE (Partición de Equivalencia) y AVL (Análisis de Valores Límite)
// ============================================================================

const request = require('supertest');
const app = require('../src/app');
const { resetStore, seedData } = require('../src/data/store');

beforeEach(() => {
  resetStore();
  seedData();
});

describe('Módulo de Habitaciones', () => {

  describe('POST /api/habitaciones - Crear habitación', () => {

    const validRoom = {
      numero: 401,
      tipo: 'doble',
      precio: 200.00,
      piso: 4,
    };

    // --- CLASE VÁLIDA ---
    test('PE-V1: Debe crear habitación con datos válidos', async () => {
      const res = await request(app).post('/api/habitaciones').send(validRoom);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.number).toBe(401);
    });

    // =================================================================
    // NÚMERO - Valores Límite
    // =================================================================
    test('AVL-NUM1: Debe rechazar número 99 (límite inferior - 1)', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, numero: 99 });
      expect(res.status).toBe(400);
    });

    test('AVL-NUM2: Debe aceptar número 100 (límite inferior)', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, numero: 100 });
      expect(res.status).toBe(201);
    });

    test('AVL-NUM3: Debe aceptar número 101 (límite inferior + 1)', async () => {
      // 101 ya existe en seed, usar otro
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, numero: 103 });
      expect(res.status).toBe(201);
    });

    test('AVL-NUM4: Debe aceptar número 998 (límite superior - 1)', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, numero: 998 });
      expect(res.status).toBe(201);
    });

    test('AVL-NUM5: Debe aceptar número 999 (límite superior)', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, numero: 999 });
      expect(res.status).toBe(201);
    });

    test('AVL-NUM6: Debe rechazar número 1000 (límite superior + 1)', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, numero: 1000 });
      expect(res.status).toBe(400);
    });

    test('PE-I-NUM1: Debe rechazar número negativo', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, numero: -1 });
      expect(res.status).toBe(400);
    });

    test('PE-I-NUM2: Debe rechazar número decimal', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, numero: 101.5 });
      expect(res.status).toBe(400);
    });

    test('PE-I-NUM3: Debe rechazar número como texto', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, numero: 'abc' });
      expect(res.status).toBe(400);
    });

    test('PE-I-NUM4: Debe rechazar número duplicado', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, numero: 101 });
      expect(res.status).toBe(409); // 101 ya existe en seed
    });

    // =================================================================
    // TIPO - Partición de Equivalencia
    // =================================================================
    test('PE-V-TIPO1: Debe aceptar tipo "individual"', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, tipo: 'individual', numero: 501 });
      expect(res.status).toBe(201);
    });

    test('PE-V-TIPO2: Debe aceptar tipo "doble"', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, tipo: 'doble', numero: 502 });
      expect(res.status).toBe(201);
    });

    test('PE-V-TIPO3: Debe aceptar tipo "suite"', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, tipo: 'suite', numero: 503 });
      expect(res.status).toBe(201);
    });

    test('PE-I-TIPO1: Debe rechazar tipo "triple"', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, tipo: 'triple' });
      expect(res.status).toBe(400);
    });

    test('PE-I-TIPO2: Debe rechazar tipo vacío', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, tipo: '' });
      expect(res.status).toBe(400);
    });

    test('PE-I-TIPO3: Debe rechazar tipo numérico', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, tipo: 123 });
      expect(res.status).toBe(400);
    });

    // =================================================================
    // PRECIO - Valores Límite
    // =================================================================
    test('AVL-PRECIO1: Debe rechazar precio 49.99 (límite inferior - 0.01)', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, precio: 49.99, numero: 600 });
      expect(res.status).toBe(400);
    });

    test('AVL-PRECIO2: Debe aceptar precio 50.00 (límite inferior)', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, precio: 50.00, numero: 601 });
      expect(res.status).toBe(201);
    });

    test('AVL-PRECIO3: Debe aceptar precio 50.01 (límite inferior + 0.01)', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, precio: 50.01, numero: 602 });
      expect(res.status).toBe(201);
    });

    test('AVL-PRECIO4: Debe aceptar precio 4999.99 (límite superior - 0.01)', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, precio: 4999.99, numero: 603 });
      expect(res.status).toBe(201);
    });

    test('AVL-PRECIO5: Debe aceptar precio 5000.00 (límite superior)', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, precio: 5000.00, numero: 604 });
      expect(res.status).toBe(201);
    });

    test('AVL-PRECIO6: Debe rechazar precio 5000.01 (límite superior + 0.01)', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, precio: 5000.01, numero: 605 });
      expect(res.status).toBe(400);
    });

    test('PE-I-PRECIO1: Debe rechazar precio negativo', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, precio: -100 });
      expect(res.status).toBe(400);
    });

    test('PE-I-PRECIO2: Debe rechazar precio 0', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, precio: 0 });
      expect(res.status).toBe(400);
    });

    // =================================================================
    // PISO - Valores Límite
    // =================================================================
    test('AVL-PISO1: Debe rechazar piso 0 (límite inferior - 1)', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, piso: 0, numero: 700 });
      expect(res.status).toBe(400);
    });

    test('AVL-PISO2: Debe aceptar piso 1 (límite inferior)', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, piso: 1, numero: 701 });
      expect(res.status).toBe(201);
    });

    test('AVL-PISO3: Debe aceptar piso 20 (límite superior)', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, piso: 20, numero: 702 });
      expect(res.status).toBe(201);
    });

    test('AVL-PISO4: Debe rechazar piso 21 (límite superior + 1)', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, piso: 21, numero: 703 });
      expect(res.status).toBe(400);
    });

    test('PE-I-PISO1: Debe rechazar piso negativo', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, piso: -5 });
      expect(res.status).toBe(400);
    });

    test('PE-I-PISO2: Debe rechazar piso decimal', async () => {
      const res = await request(app).post('/api/habitaciones').send({ ...validRoom, piso: 2.5 });
      expect(res.status).toBe(400);
    });
  });

  // ========================================================================
  // TESTS DE LECTURA
  // ========================================================================
  describe('GET /api/habitaciones', () => {
    test('Debe retornar las habitaciones de seed', async () => {
      const res = await request(app).get('/api/habitaciones');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test('Debe filtrar por tipo', async () => {
      const res = await request(app).get('/api/habitaciones?tipo=suite');
      expect(res.status).toBe(200);
      res.body.data.forEach(r => expect(r.type).toBe('suite'));
    });

    test('Debe filtrar por estado', async () => {
      const res = await request(app).get('/api/habitaciones?estado=disponible');
      expect(res.status).toBe(200);
      res.body.data.forEach(r => expect(r.status).toBe('disponible'));
    });
  });
});
