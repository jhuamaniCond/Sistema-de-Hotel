// ============================================================================
// SERVIDOR PRINCIPAL - SISTEMA DE GESTIÓN DE HOTEL
// Grupo 4 - Lab 5 Pruebas de Software
// ============================================================================

const express = require('express');
const cors = require('cors');
const path = require('path');

const { handleJsonParseError, globalErrorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { seedData } = require('./data/store');

// Rutas
const guestRoutes = require('./routes/guestRoutes');
const roomRoutes = require('./routes/roomRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const billingRoutes = require('./routes/billingRoutes');

const app = express();

// ============================================================================
// MIDDLEWARE GLOBALES
// ============================================================================

// CORS
app.use(cors());

// Parseo de JSON con límite de tamaño
app.use(express.json({ limit: '1mb' }));

// Manejar JSON malformado
app.use(handleJsonParseError);

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '..', 'public')));

// ============================================================================
// RUTAS API
// ============================================================================

app.use('/api/huespedes', guestRoutes);
app.use('/api/habitaciones', roomRoutes);
app.use('/api/reservaciones', reservationRoutes);
app.use('/api/facturacion', billingRoutes);

// Ruta de salud del sistema
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      sistema: 'Sistema de Gestión de Hotel',
      version: '1.0.0',
      grupo: 'Grupo 4',
      timestamp: new Date().toISOString(),
    },
  });
});

// ============================================================================
// MANEJO DE ERRORES
// ============================================================================

// Ruta no encontrada (404)
app.use(notFoundHandler);

// Manejador global de errores
app.use(globalErrorHandler);

// ============================================================================
// CAPTURAR ERRORES NO MANEJADOS
// ============================================================================

process.on('uncaughtException', (err) => {
  console.error('[FATAL] Excepción no capturada:', err.message);
  // NO cerrar el proceso - mantener el servidor vivo
});

process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] Promesa rechazada no manejada:', reason);
  // NO cerrar el proceso - mantener el servidor vivo
});

// ============================================================================
// INICIAR SERVIDOR
// ============================================================================

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  // Cargar datos de ejemplo
  seedData();

  app.listen(PORT, () => {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║   🏨 SISTEMA DE GESTIÓN DE HOTEL - Grupo 4      ║');
    console.log('║   Lab 5 - Pruebas de Software                   ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log(`║   🌐 Servidor: http://localhost:${PORT}             ║`);
    console.log(`║   📡 API:      http://localhost:${PORT}/api          ║`);
    console.log('╠══════════════════════════════════════════════════╣');
    console.log('║   Endpoints disponibles:                        ║');
    console.log('║   • GET/POST       /api/huespedes               ║');
    console.log('║   • GET/POST       /api/habitaciones            ║');
    console.log('║   • GET/POST       /api/reservaciones           ║');
    console.log('║   • GET/POST       /api/facturacion             ║');
    console.log('║   • GET            /api/health                  ║');
    console.log('╚══════════════════════════════════════════════════╝');
  });
}

// Exportar para testing
module.exports = app;
