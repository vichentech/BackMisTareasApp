const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const syncRoutes = require('./routes/syncRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const syncController = require('./controllers/syncController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de seguridad
app.use(helmet());

// CORS configurado para desarrollo
const isDevelopment = process.env.NODE_ENV !== 'production';

if (isDevelopment) {
  console.log('⚠️  MODO DESARROLLO: CORS abierto para todos los orígenes');
  app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Length', 'X-Request-Id']
  }));
} else {
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:5173'];

  console.log('🔒 MODO PRODUCCIÓN: CORS restringido a:', allowedOrigins);
  app.use(cors({
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: isDevelopment ? 1000 : (parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100),
  message: 'Demasiadas peticiones desde esta IP, por favor intenta más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isDevelopment && (req.ip === '::1' || req.ip === '127.0.0.1')
});

app.use('/sync/', limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// RUTAS PRINCIPALES
// ============================================

/**
 * HEAD /
 * Prueba de conexión rápida (usado por el botón "Probar Conexión")
 */
app.head('/', syncController.testConnection);

/**
 * GET /status
 * Health check del servidor
 */
app.get('/status', syncController.getStatus);

/**
 * Rutas de sincronización
 * POST /sync/check - Comprobar actualizaciones
 * POST /sync/push - Enviar actualizaciones
 * POST /sync/init-indexes - Inicializar índices
 */
app.use('/sync', syncRoutes);

// Ruta 404
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint no encontrado',
    availableEndpoints: [
      'HEAD /',
      'GET /status',
      'POST /sync/check',
      'POST /sync/push',
      'POST /sync/init-indexes'
    ]
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

// Inicio del servidor
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   🚀 Servidor de Sincronización Iniciado  ║
╠════════════════════════════════════════════╣
║   Puerto: ${PORT}                           
║   Entorno: ${process.env.NODE_ENV || 'development'}          
║   CORS: ${isDevelopment ? '⚠️  ABIERTO (Desarrollo)' : '🔒 RESTRINGIDO (Producción)'}
╠════════════════════════════════════════════╣
║   Endpoints disponibles:                   ║
║   • HEAD /                                 ║
║   • GET  /status                           ║
║   • POST /sync/check                       ║
║   • POST /sync/push                        ║
║   • POST /sync/init-indexes                ║
╚════════════════════════════════════════════╝
  `);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT recibido. Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado correctamente');
    process.exit(0);
  });
});

module.exports = app;