const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { 
  validateLogin, 
  validateCreateUser,
  validateChangePassword,
  validateAdminChangePassword
} = require('../middleware/authValidation');

/**
 * Rutas de Autenticación
 */

// POST /auth/login - Login de usuario regular
router.post('/login', validateLogin, authController.login);

// POST /auth/login-admin - Login de administrador
router.post('/login-admin', validateLogin, authController.loginAdmin);

// POST /auth/create-user - Crear nuevo usuario
router.post('/create-user', validateCreateUser, authController.createUser);

// POST /auth/change-password - Cambiar contraseña del propio usuario
router.post('/change-password', validateChangePassword, authController.changePassword);

// POST /auth/admin-change-password - Cambiar contraseña de otro usuario (admin)
router.post('/admin-change-password', validateAdminChangePassword, authController.adminChangePassword);

// POST /auth/init-db - Inicializar base de datos
router.post('/init-db', authController.initDatabase);

module.exports = router;