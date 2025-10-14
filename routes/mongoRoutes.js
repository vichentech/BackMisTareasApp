const express = require('express');
const router = express.Router();
const { 
  validateMongoRequest, 
  validateGetUpdates, 
  validateGetMonth,
  validateSaveMonth,
  validateConfig 
} = require('../middleware/validation');
const mongoController = require('../controllers/mongoController');

/**
 * Endpoint antiguo para compatibilidad
 * POST /api/mongo/data
 */
router.post('/data', validateMongoRequest, mongoController.handleMongoOperation);

/**
 * Nuevos endpoints según especificaciones
 */

// GET /api/mongo/data/:username/updates
// Obtiene las marcas de tiempo de actualización de todos los meses de un usuario
router.get(
  '/data/:username/updates', 
  validateGetUpdates, 
  mongoController.getUserUpdates
);

// GET /api/mongo/data/:username/:yearMonth
// Obtiene los datos completos de un mes específico
router.get(
  '/data/:username/:yearMonth', 
  validateGetMonth, 
  mongoController.getMonthData
);

// POST /api/mongo/data/save
// Guarda o actualiza los datos de un mes completo
router.post(
  '/data/save', 
  validateSaveMonth, 
  mongoController.saveMonthData
);

// POST /api/mongo/data/init-indexes
// Inicializa los índices de la base de datos (llamar una vez al configurar)
router.post(
  '/data/init-indexes', 
  validateConfig, 
  mongoController.initializeIndexes
);

module.exports = router;