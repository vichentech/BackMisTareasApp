const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin, validateCreateUser } = require('../middleware/authValidation');

/**
 * Rutas de Autenticación con JWT
 */

// POST /auth/login - Login de usuario (devuelve JWT)
router.post('/login', validateLogin, authController.login);

// POST /auth/login-admin - Login de administrador (devuelve JWT)
router.post('/login-admin', validateLogin, authController.loginAdmin);

// POST /auth/refresh - Refrescar token de acceso
router.post('/refresh', authController.refreshToken);

// POST /auth/verify - Verificar si un token es válido
router.post('/verify', authController.verifyToken);

// POST /auth/create-user - Crear nuevo usuario
router.post('/create-user', validateCreateUser, authController.createUser);

// POST /auth/change-password - Cambiar contraseña
router.post('/change-password', authController.changePassword);

// POST /auth/admin-change-password - Admin cambia contraseña
router.post('/admin-change-password', authController.adminChangePassword);

// POST /auth/init-db - Inicializar base de datos
router.post('/init-db', authController.initDatabase);

module.exports = router;