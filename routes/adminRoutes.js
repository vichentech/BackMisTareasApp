const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateCreateUser } = require('../middleware/authValidation');
const { requireAdmin } = require('../middleware/authMiddleware');

/**
 * Rutas de Administración
 * Todas las rutas requieren autenticación de administrador
 */

// POST /admin/users - Crear nuevo usuario (solo admin)
router.post('/users', requireAdmin, validateCreateUser, authController.adminCreateUser);

module.exports = router;
