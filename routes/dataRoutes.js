const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

/**
 * Rutas de Datos de Usuario
 */

// GET /data/timestamps/:username - Obtener timestamps de un usuario
router.get('/timestamps/:username', dataController.getTimestamps);

// GET /data/users - Obtener lista de usuarios
router.get('/users', dataController.getUsers);

module.exports = router;