// ============================================================================
// TESTS DE HUÉSPEDES
// Cobertura: PE (Partición de Equivalencia) y AVL (Análisis de Valores Límite)
// ============================================================================

const request = require('supertest');
const app = require('../src/app');
const { resetStore, seedData } = require('../src/data/store');

beforeEach(() => {
  resetStore();
  seedData();
});

describe('Módulo de Huéspedes', () => {

  // ========================================================================
  // TESTS DE CREACIÓN (POST /api/huespedes)
  // ========================================================================
  describe('POST /api/huespedes - Crear huésped', () => {

    const validGuest = {
      nombre: 'Juan Carlos Pérez',
      dni: '12345678',
      edad: 30,
      telefono: '987654321',
      email: 'juan@correo.com',
    };

    // --- CLASE VÁLIDA: Datos completos y correctos ---
    test('PE-V1: Debe crear huésped con datos válidos', async () => {
      const res = await request(app).post('/api/huespedes').send(validGuest);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nombre).toBe('Juan Carlos Pérez');
      expect(res.body.data.dni).toBe('12345678');
    });

    // =================================================================
    // NOMBRE - Partición de Equivalencia
    // =================================================================
    test('PE-I1: Debe rechazar nombre vacío', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, nombre: '' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('PE-I2: Debe rechazar nombre con números', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, nombre: 'Juan123' });
      expect(res.status).toBe(400);
    });

    test('PE-I3: Debe rechazar nombre con caracteres especiales', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, nombre: 'Juan@#$' });
      expect(res.status).toBe(400);
    });

    test('PE-I4: Debe rechazar nombre null', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, nombre: null });
      expect(res.status).toBe(400);
    });

    test('PE-I5: Debe rechazar sin campo nombre', async () => {
      const { nombre, ...sinNombre } = validGuest;
      const res = await request(app).post('/api/huespedes').send(sinNombre);
      expect(res.status).toBe(400);
    });

    // Nombre - Valores Límite
    test('AVL-1: Debe rechazar nombre de 1 carácter (límite inferior - 1)', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, nombre: 'A' });
      expect(res.status).toBe(400);
    });

    test('AVL-2: Debe aceptar nombre de 2 caracteres (límite inferior)', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, nombre: 'Ab' });
      expect(res.status).toBe(201);
    });

    test('AVL-3: Debe aceptar nombre de 3 caracteres (límite inferior + 1)', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, nombre: 'Abc', dni: '11111111' });
      expect(res.status).toBe(201);
    });

    test('AVL-4: Debe aceptar nombre de 100 caracteres (límite superior)', async () => {
      const nombre = 'A'.repeat(100);
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, nombre, dni: '22222222' });
      expect(res.status).toBe(201);
    });

    test('AVL-5: Debe rechazar nombre de 101 caracteres (límite superior + 1)', async () => {
      const nombre = 'A'.repeat(101);
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, nombre });
      expect(res.status).toBe(400);
    });

    // =================================================================
    // DNI - Partición de Equivalencia + Valores Límite
    // =================================================================
    test('PE-V-DNI: Debe aceptar DNI de 8 dígitos', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, dni: '87654321' });
      expect(res.status).toBe(201);
    });

    test('PE-I-DNI1: Debe rechazar DNI con letras', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, dni: '1234abcd' });
      expect(res.status).toBe(400);
    });

    test('AVL-DNI1: Debe rechazar DNI de 7 dígitos', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, dni: '1234567' });
      expect(res.status).toBe(400);
    });

    test('AVL-DNI2: Debe rechazar DNI de 9 dígitos', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, dni: '123456789' });
      expect(res.status).toBe(400);
    });

    test('PE-I-DNI2: Debe rechazar DNI vacío', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, dni: '' });
      expect(res.status).toBe(400);
    });

    test('PE-I-DNI3: Debe rechazar DNI duplicado', async () => {
      await request(app).post('/api/huespedes').send(validGuest);
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, email: 'otro@mail.com' });
      expect(res.status).toBe(409);
    });

    // =================================================================
    // EDAD - Partición de Equivalencia + Valores Límite
    // =================================================================
    test('PE-V-EDAD: Debe aceptar edad válida (30)', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, dni: '33333333' });
      expect(res.status).toBe(201);
    });

    test('AVL-EDAD1: Debe rechazar edad 17 (límite inferior - 1)', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, edad: 17 });
      expect(res.status).toBe(400);
    });

    test('AVL-EDAD2: Debe aceptar edad 18 (límite inferior)', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, edad: 18, dni: '44444444' });
      expect(res.status).toBe(201);
    });

    test('AVL-EDAD3: Debe aceptar edad 19 (límite inferior + 1)', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, edad: 19, dni: '55555555' });
      expect(res.status).toBe(201);
    });

    test('AVL-EDAD4: Debe aceptar edad 119 (límite superior - 1)', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, edad: 119, dni: '66666666' });
      expect(res.status).toBe(201);
    });

    test('AVL-EDAD5: Debe aceptar edad 120 (límite superior)', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, edad: 120, dni: '77777777' });
      expect(res.status).toBe(201);
    });

    test('AVL-EDAD6: Debe rechazar edad 121 (límite superior + 1)', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, edad: 121 });
      expect(res.status).toBe(400);
    });

    test('PE-I-EDAD1: Debe rechazar edad negativa', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, edad: -1 });
      expect(res.status).toBe(400);
    });

    test('PE-I-EDAD2: Debe rechazar edad 0', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, edad: 0 });
      expect(res.status).toBe(400);
    });

    test('PE-I-EDAD3: Debe rechazar edad decimal', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, edad: 25.5 });
      expect(res.status).toBe(400);
    });

    test('PE-I-EDAD4: Debe rechazar edad como texto', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, edad: 'veinticinco' });
      expect(res.status).toBe(400);
    });

    // =================================================================
    // TELÉFONO - Partición de Equivalencia + Valores Límite
    // =================================================================
    test('PE-I-TEL1: Debe rechazar teléfono que no empiece con 9', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, telefono: '887654321' });
      expect(res.status).toBe(400);
    });

    test('AVL-TEL1: Debe rechazar teléfono de 8 dígitos', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, telefono: '98765432' });
      expect(res.status).toBe(400);
    });

    test('AVL-TEL2: Debe rechazar teléfono de 10 dígitos', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, telefono: '9876543210' });
      expect(res.status).toBe(400);
    });

    // =================================================================
    // EMAIL
    // =================================================================
    test('PE-I-EMAIL1: Debe rechazar email sin @', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, email: 'juancorreo.com' });
      expect(res.status).toBe(400);
    });

    test('PE-I-EMAIL2: Debe rechazar email sin dominio', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, email: 'juan@' });
      expect(res.status).toBe(400);
    });

    test('PE-I-EMAIL3: Debe rechazar email vacío', async () => {
      const res = await request(app).post('/api/huespedes').send({ ...validGuest, email: '' });
      expect(res.status).toBe(400);
    });

    // =================================================================
    // BODY INVÁLIDO
    // =================================================================
    test('PE-I-BODY1: Debe rechazar body vacío', async () => {
      const res = await request(app).post('/api/huespedes').send({});
      expect(res.status).toBe(400);
    });
  });

  // ========================================================================
  // TESTS DE LECTURA
  // ========================================================================
  describe('GET /api/huespedes', () => {
    test('Debe retornar lista vacía inicialmente', async () => {
      const res = await request(app).get('/api/huespedes');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('Debe retornar 404 para ID inexistente', async () => {
      const res = await request(app).get('/api/huespedes/00000000-0000-4000-8000-000000000000');
      expect(res.status).toBe(404);
    });

    test('Debe retornar 400 para ID inválido', async () => {
      const res = await request(app).get('/api/huespedes/id-invalido');
      expect(res.status).toBe(400);
    });
  });

  // ========================================================================
  // TESTS DE ELIMINACIÓN
  // ========================================================================
  describe('DELETE /api/huespedes/:id', () => {
    test('Debe eliminar huésped existente', async () => {
      const createRes = await request(app).post('/api/huespedes').send({
        nombre: 'Para Eliminar', dni: '99999999', edad: 25, telefono: '912345678', email: 'del@test.com'
      });
      const id = createRes.body.data.id;
      const res = await request(app).delete(`/api/huespedes/${id}`);
      expect(res.status).toBe(200);
    });

    test('Debe retornar 404 al eliminar ID inexistente', async () => {
      const res = await request(app).delete('/api/huespedes/00000000-0000-4000-8000-000000000000');
      expect(res.status).toBe(404);
    });
  });
});
