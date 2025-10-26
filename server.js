const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const syncRoutes = require('./routes/syncRoutes');
const authRoutes = require('./routes/authRoutes');
const configRoutes = require('./routes/configRoutes');
const dataRoutes = require('./routes/dataRoutes');
const setupRoutes = require('./routes/setupRoutes');
const adminRoutes = require('./routes/adminRoutes');
const listsRoutes = require('./routes/listsRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const syncController = require('./controllers/syncController');
const requestLogger = require('./middleware/requestLogger');

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

// Rate limiting más estricto para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isDevelopment ? 100 : 20, // 20 intentos en producción
  message: 'Demasiados intentos de autenticación, por favor intenta más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isDevelopment && (req.ip === '::1' || req.ip === '127.0.0.1')
});

// Rate limiting moderado para setup (público pero controlado)
const setupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isDevelopment ? 100 : 10, // 10 intentos en producción
  message: 'Demasiados intentos de configuración, por favor intenta más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isDevelopment && (req.ip === '::1' || req.ip === '127.0.0.1')
});

app.use('/sync/', limiter);
app.use('/auth/', authLimiter);
app.use('/setup/', setupLimiter); // NUEVO
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// MIDDLEWARE DE LOGGING (SOLO EN DESARROLLO)
// ============================================
app.use(requestLogger);

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
 * Rutas de configuración inicial (públicas)
 * GET /setup/status - Verificar si se necesita configuración inicial
 * POST /setup/create-admin - Crear primer administrador
 */
app.use('/setup', setupRoutes);

/**
 * Rutas de sincronización
 * POST /sync/check - Comprobar actualizaciones
 * POST /sync/push - Enviar actualizaciones
 * POST /sync/init-indexes - Inicializar índices
 */
app.use('/sync', syncRoutes);

/**
 * Rutas de autenticación (con JWT)
 * POST /auth/login - Login de usuario (devuelve JWT)
 * POST /auth/login-admin - Login de administrador (devuelve JWT)
 * POST /auth/refresh - Refrescar token de acceso
 * POST /auth/verify - Verificar token
 * POST /auth/create-user - Crear usuario
 * POST /auth/change-password - Cambiar contraseña
 * POST /auth/admin-change-password - Admin cambia contraseña
 * POST /auth/init-db - Inicializar base de datos
 */
app.use('/auth', authRoutes);

/**
 * Rutas de configuración (con JWT)
 * GET /config/master-lists - Obtener listas maestras (requiere JWT)
 * POST /config/master-lists - Actualizar listas maestras (requiere JWT admin)
 * POST /config/init-master-lists - Inicializar listas maestras
 */
app.use('/config', configRoutes);

/**
 * Rutas de datos (con JWT)
 * GET /data/timestamps/:username - Obtener timestamps de un usuario (requiere JWT)
 * POST /data/months/:username - Obtener datos de meses específicos (requiere JWT)
 * PUT /data/months/:username - Actualizar datos de meses específicos (requiere JWT)
 * GET /data/users - Obtener lista de usuarios (requiere JWT)
 */
app.use('/data', dataRoutes);

/**
 * Rutas de listas personales (con JWT)
 * GET /data/lists/:username - Obtener listas personales de un usuario (requiere JWT)
 * POST /data/lists/:username - Actualizar listas personales de un usuario (requiere JWT)
 */
app.use('/data', listsRoutes);

/**
 * Rutas de administración (con JWT admin)
 * POST /admin/users - Crear nuevo usuario (requiere JWT admin)
 * POST /admin/users/sync - Sincronización masiva de usuarios (requiere JWT admin)
 */
app.use('/admin', adminRoutes);

 // Ruta 404
 app.use((req, res) => {
   res.status(404).json({
     success: false,
     message: 'Endpoint no encontrado',
     availableEndpoints: [
       'HEAD /',
       'GET /status',
       'GET /setup/status',
       'POST /setup/create-admin',
       'POST /sync/check',
       'POST /sync/push',
       'POST /sync/init-indexes',
       'POST /auth/login',
       'POST /auth/login-admin',
       'POST /auth/refresh',
       'POST /auth/verify',
       'POST /auth/create-user',
       'POST /auth/change-password',
       'POST /auth/admin-change-password',
       'POST /auth/init-db',
       'GET /config/master-lists (requiere JWT)',
       'POST /config/master-lists (requiere JWT admin)',
       'POST /config/init-master-lists',
       'GET /data/timestamps/:username (requiere JWT)',
       'POST /data/months/:username (requiere JWT)',
       'PUT /data/months/:username (requiere JWT)',
       'GET /data/users (requiere JWT)',
       'GET /data/lists/:username (requiere JWT)',
       'POST /data/lists/:username (requiere JWT)',
       'POST /admin/users (requiere JWT admin)',
       'POST /admin/users/sync (requiere JWT admin)'
     ]
   });
 });

// Middleware de manejo de errores
app.use(errorHandler);

 // Inicio del servidor
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          🚀 Servidor de Sincronización Iniciado               ║
╠═══════════════════════════════════════════════════════════════╣
║   Puerto: ${PORT.toString().padEnd(52)}║
║   Entorno: ${(process.env.NODE_ENV || 'development').padEnd(51)}║
║   CORS: ${(isDevelopment ? '⚠️  ABIERTO (Desarrollo)' : '🔒 RESTRINGIDO (Producción)').padEnd(54)}║
║   Logging: ${(isDevelopment ? '📝 ACTIVADO' : '🔇 DESACTIVADO').padEnd(51)}║
║   Auth: 🔐 JWT (${(process.env.JWT_EXPIRES_IN || '24h')})${' '.repeat(44 - (process.env.JWT_EXPIRES_IN || '24h').length)}║
╠═══════════════════════════════════════════════════════════════╣
║   📋 ENDPOINTS DISPONIBLES:                                   ║
╠═══════════════════════════════════════════════════════════════╣
║   🏥 Health Check:                                            ║
║   • HEAD /                                                    ║
║   • GET  /status                                              ║
║                                                               ║
║   🔧 Configuración Inicial (Público):                         ║
║   • GET  /setup/status                                        ║
║   • POST /setup/create-admin                                  ║
║                                                               ║
║   🔐 Autenticación:                                           ║
║   • POST /auth/login                                          ║
║   • POST /auth/login-admin                                    ║
║   • POST /auth/refresh                                        ║
║   • POST /auth/verify                                         ║
║   • POST /auth/create-user                                    ║
║   • POST /auth/change-password                                ║
║   • POST /auth/admin-change-password                          ║
║   • POST /auth/init-db                                        ║
║                                                               ║
║   📡 Sincronización:                                          ║
║   • POST /sync/check                                          ║
║   • POST /sync/push                                           ║
║   • POST /sync/init-indexes                                   ║
║                                                               ║
║   📊 Datos (Requiere JWT):                                    ║
║   • GET  /data/timestamps/:username                           ║
║   • POST /data/months/:username                               ║
║   • PUT  /data/months/:username                               ║
║   • GET  /data/users                                          ║
║                                                               ║
║   📝 Listas Personales (Requiere JWT):                        ║
║   • GET  /data/lists/:username                                ║
║   • POST /data/lists/:username                                ║
║                                                               ║
║   ⚙️  Configuración (Requiere JWT):                           ║
║   • GET  /config/master-lists                                 ║
║   • POST /config/master-lists (Requiere Admin)                ║
║   • POST /config/init-master-lists                            ║
║                                                               ║
║   👥 Administración (Requiere JWT Admin):                     ║
║   • POST /admin/users                                         ║   
║   • POST /admin/users/sync                                    ║
╚═══════════════════════════════════════════════════════════════╝
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