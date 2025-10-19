const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const { requireAuth } = require('../middleware/authMiddleware');

/**
 * Rutas de Datos de Usuario
 * Todas las rutas requieren autenticación JWT
 */

// GET /data/timestamps/:username - Obtener timestamps de un usuario
router.get('/timestamps/:username', requireAuth, dataController.getTimestamps);

// POST /data/months/:username - Obtener datos de meses específicos
router.post('/months/:username', requireAuth, dataController.getMonthsData);

// PUT /data/months/:username - Actualizar datos de meses específicos
router.put('/months/:username', requireAuth, dataController.updateMonthsData);

// GET /data/users - Obtener lista de usuarios
router.get('/users', requireAuth, dataController.getUsers);

module.exports = router;