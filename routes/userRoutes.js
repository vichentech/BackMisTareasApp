const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * Rutas de Usuarios
 */

// GET /users - Obtener lista de usuarios
router.get('/', authController.getUsers);

module.exports = router;