const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const { validateUpdateMasterLists } = require('../middleware/configValidation');
const { requireAdmin, requireAuth } = require('../middleware/authMiddleware');

/**
 * Rutas de Configuración con JWT
 */

// GET /config/master-lists - Obtener listas maestras (requiere autenticación)
router.get('/master-lists', requireAuth, configController.getMasterLists);

// POST /config/master-lists - Actualizar listas maestras (solo admin con JWT)
router.post(
  '/master-lists',
  requireAdmin,
  validateUpdateMasterLists,
  configController.updateMasterLists
);

// POST /config/init-master-lists - Inicializar listas maestras
router.post('/init-master-lists', configController.initMasterLists);

module.exports = router;