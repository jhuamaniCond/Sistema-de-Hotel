// ============================================================================
// ALMACENAMIENTO EN MEMORIA
// Simula una base de datos con arrays y Maps para acceso rápido
// ============================================================================

const { v4: uuidv4 } = require('uuid');

// Almacenes principales
const store = {
  guests: new Map(),       // id -> guest object
  rooms: new Map(),        // id -> room object
  reservations: new Map(), // id -> reservation object
  billings: new Map(),     // id -> billing object

  // Índices secundarios para búsquedas rápidas
  guestsByDni: new Map(),     // dni -> guest id
  roomsByNumber: new Map(),   // roomNumber -> room id
};

/**
 * Genera un ID único
 * @returns {string} UUID v4
 */
function generateId() {
  return uuidv4();
}

/**
 * Reinicia todo el store (útil para tests)
 */
function resetStore() {
  store.guests.clear();
  store.rooms.clear();
  store.reservations.clear();
  store.billings.clear();
  store.guestsByDni.clear();
  store.roomsByNumber.clear();
}

/**
 * Inicializa datos de ejemplo
 */
function seedData() {
  // Habitaciones de ejemplo
  const sampleRooms = [
    { number: 101, type: 'individual', price: 80.00, floor: 1, status: 'disponible' },
    { number: 102, type: 'individual', price: 85.00, floor: 1, status: 'disponible' },
    { number: 201, type: 'doble', price: 150.00, floor: 2, status: 'disponible' },
    { number: 202, type: 'doble', price: 160.00, floor: 2, status: 'disponible' },
    { number: 301, type: 'suite', price: 350.00, floor: 3, status: 'disponible' },
    { number: 302, type: 'suite', price: 400.00, floor: 3, status: 'mantenimiento' },
  ];

  sampleRooms.forEach((room) => {
    const id = generateId();
    const roomData = {
      id,
      ...room,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.rooms.set(id, roomData);
    store.roomsByNumber.set(room.number, id);
  });
}

module.exports = {
  store,
  generateId,
  resetStore,
  seedData,
};
